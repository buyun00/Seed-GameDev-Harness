import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import type {
  ConstitutionAnalysisCache,
  ConstitutionRule,
  ConstitutionRuleCategory,
  ImportDirective,
  SourceFileRecord,
} from '../models/constitution-rule.js'
import type { AppContext } from '../types.js'
import { hashString } from '../utils/hash.js'
import { extractImports } from '../utils/markdown.js'
import {
  buildConstitutionFilePrompt,
  buildConstitutionComparisonPrompt,
  finalizeComparedRules,
  parseConstitutionAnalysisResult,
  parseConstitutionComparisonResult,
  summarizeConstitutionRules,
} from '../utils/constitution-analysis.js'
import { agentQuery } from '../worker/agents/base-agent.js'

export interface ConstitutionAnalysisRunnerOptions {
  signal?: AbortSignal
  onProgress?: (step: string, percent: number, message: string) => void
  onLog?: (message: string) => void
}

const MAX_ANALYSIS_ATTEMPTS = 3
const MAX_COMPARISON_ATTEMPTS = 3
const CATEGORY_COMPARE_BASE_PROGRESS = 85
const CATEGORY_COMPARE_PROGRESS_SPAN = 10
const CATEGORY_ORDER: ConstitutionRuleCategory[] = [
  'language_output',
  'core_principles',
  'agent_collaboration',
  'tools_commands',
  'escalation_decision',
  'memory_context',
  'activation_conditions',
  'safety_constraints',
  'other',
]

export async function runConstitutionAnalysisPipeline(
  ctx: AppContext,
  options: ConstitutionAnalysisRunnerOptions = {},
): Promise<ConstitutionAnalysisCache> {
  const sourceFiles = ctx.projectContext.constitutionFiles
  const sources: SourceFileRecord[] = []
  const fileContents: Array<{ path: string; content: string }> = []

  options.onProgress?.('reading_files', 5, 'Reading constitution source files...')
  options.onLog?.(`Found ${sourceFiles.length} constitution file(s)`)

  for (const absPath of sourceFiles) {
    const content = await readFile(absPath, 'utf-8')
    const fileStat = await stat(absPath)
    const relPath = ctx.projectContext.relative(absPath)

    sources.push({
      path: relPath,
      hash: hashString(content),
      size: content.length,
      lastModified: fileStat.mtime.toISOString(),
    })
    fileContents.push({ path: relPath, content })
    options.onLog?.(`Loaded ${relPath} (${content.split(/\r?\n/).length} lines)`)
  }

  const rawResults: string[] = []
  const extractedRules: ConstitutionRule[] = []

  for (let index = 0; index < fileContents.length; index++) {
    const file = fileContents[index]
    const baseProgress = fileContents.length === 0
      ? 20
      : 20 + Math.round((index / fileContents.length) * 55)

    options.onProgress?.(
      'running_ai',
      baseProgress,
      `Analyzing ${file.path} (${index + 1}/${fileContents.length})...`,
    )

    const { rawResult, rules } = await analyzeFileWithRetries(ctx, file, options)
    rawResults.push(`--- ${file.path} ---\n${rawResult}`)
    extractedRules.push(...rules)
    options.onLog?.(`${file.path}: extracted ${rules.length} rule(s)`)
  }

  options.onProgress?.('post_processing', CATEGORY_COMPARE_BASE_PROGRESS, 'Comparing extracted rules by category...')

  const groupedRules = groupRulesByCategory(extractedRules)
  const comparisonTasks = groupedRules.map(async ([category, rules], index) => {
    const compareProgress = CATEGORY_COMPARE_BASE_PROGRESS
      + Math.round((index / Math.max(groupedRules.length, 1)) * CATEGORY_COMPARE_PROGRESS_SPAN)
    options.onLog?.(`category-${category}: queued ${rules.length} rule(s) for comparison`)
    options.onProgress?.(
      'post_processing',
      compareProgress,
      `Comparing ${getCategoryDisplayName(category)} (${index + 1}/${groupedRules.length})...`,
    )

    if (rules.length <= 1) {
      options.onLog?.(`category-${category}: skipped LLM comparison (${rules.length} rule)`)
      return {
        category,
        rawResult: JSON.stringify({ rules: rules.map(rule => ({ id: rule.id, status: rule.status, relations: rule.relations })) }),
        rules,
      }
    }

    const result = await compareRulesWithRetries(ctx, category, rules, options)
    options.onLog?.(`category-${category}: comparison completed (${result.rules.length} rule(s))`)
    return {
      category,
      ...result,
    }
  })

  const comparisonResults = await Promise.all(comparisonTasks)
  for (const result of comparisonResults) {
    rawResults.push(`--- compare-${result.category} ---\n${result.rawResult}`)
  }

  const rules = finalizeComparedRules(
    comparisonResults.flatMap(result => result.rules),
  )
  const imports = buildImports(ctx, fileContents)
  const importedSources = await collectImportedSources(ctx, imports)
  const summary = summarizeConstitutionRules(rules)

  options.onProgress?.('done', 100, `Analysis completed: ${rules.length} rule(s) after merge`)

  return {
    version: 2,
    analyzedAt: new Date().toISOString(),
    sources,
    importedSources,
    imports,
    rules,
    relations: rules.flatMap(rule => rule.relations),
    statusSummary: summary,
    rawAnalysis: rawResults.join('\n\n'),
  }
}

async function analyzeFileWithRetries(
  ctx: AppContext,
  file: { path: string; content: string },
  options: ConstitutionAnalysisRunnerOptions,
): Promise<{ rawResult: string; rules: ConstitutionRule[] }> {
  let lastError: Error | null = null
  let lastRawResult = ''

  for (let attempt = 1; attempt <= MAX_ANALYSIS_ATTEMPTS; attempt++) {
    options.onLog?.(`${file.path}: analysis attempt ${attempt}/${MAX_ANALYSIS_ATTEMPTS}`)

    try {
      const rawResult = await agentQuery({
        prompt: buildConstitutionFilePrompt(file),
        cwd: ctx.projectContext.projectRoot,
        timeoutMs: 180_000,
        signal: options.signal,
        label: 'Constitution',
        onLog: (message) => options.onLog?.(`[${file.path}] ${message}`),
        disallowedTools: [
          'Write', 'Edit', 'MultiEdit', 'Shell',
          'WebFetch', 'WebSearch', 'TodoWrite',
        ],
      })

      lastRawResult = rawResult
      const rules = parseConstitutionAnalysisResult(rawResult, file)
      return { rawResult, rules }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      options.onLog?.(`${file.path}: attempt ${attempt} failed - ${lastError.message}`)
    }
  }

  const preview = lastRawResult.trim().slice(0, 300)
  const previewSuffix = lastRawResult.trim().length > 300 ? '...' : ''
  throw new Error(
    `Constitution analysis failed for ${file.path} after ${MAX_ANALYSIS_ATTEMPTS} attempts: `
    + `${lastError?.message ?? 'Unknown error'}`
    + (preview ? ` | last output: ${preview}${previewSuffix}` : ''),
  )
}

async function compareRulesWithRetries(
  ctx: AppContext,
  category: ConstitutionRuleCategory,
  extractedRules: ConstitutionRule[],
  options: ConstitutionAnalysisRunnerOptions,
): Promise<{ rawResult: string; rules: ConstitutionRule[] }> {
  if (extractedRules.length === 0) {
    return { rawResult: '{"rules":[]}', rules: [] }
  }

  let lastError: Error | null = null
  let lastRawResult = ''

  for (let attempt = 1; attempt <= MAX_COMPARISON_ATTEMPTS; attempt++) {
    options.onLog?.(`category-${category}: comparison attempt ${attempt}/${MAX_COMPARISON_ATTEMPTS}`)

    try {
      const rawResult = await agentQuery({
        prompt: buildConstitutionComparisonPrompt(category, extractedRules),
        cwd: ctx.projectContext.projectRoot,
        timeoutMs: 180_000,
        signal: options.signal,
        label: 'ConstitutionCompare',
        onLog: (message) => options.onLog?.(`[compare:${category}] ${message}`),
        disallowedTools: [
          'Write', 'Edit', 'MultiEdit', 'Shell',
          'WebFetch', 'WebSearch', 'TodoWrite',
        ],
      })

      lastRawResult = rawResult
      const rules = parseConstitutionComparisonResult(rawResult, extractedRules)
      return { rawResult, rules }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      options.onLog?.(`category-${category}: attempt ${attempt} failed - ${lastError.message}`)
    }
  }

  const preview = lastRawResult.trim().slice(0, 300)
  const previewSuffix = lastRawResult.trim().length > 300 ? '...' : ''
  throw new Error(
    `Constitution comparison failed for category ${category} after ${MAX_COMPARISON_ATTEMPTS} attempts: `
    + `${lastError?.message ?? 'Unknown error'}`
    + (preview ? ` | last output: ${preview}${previewSuffix}` : ''),
  )
}

function groupRulesByCategory(
  rules: ConstitutionRule[],
): Array<[ConstitutionRuleCategory, ConstitutionRule[]]> {
  const groups = new Map<ConstitutionRuleCategory, ConstitutionRule[]>()

  for (const rule of rules) {
    const bucket = groups.get(rule.category) ?? []
    bucket.push(rule)
    groups.set(rule.category, bucket)
  }

  return [...groups.entries()]
    .sort((left, right) => CATEGORY_ORDER.indexOf(left[0]) - CATEGORY_ORDER.indexOf(right[0]))
}

function getCategoryDisplayName(category: ConstitutionRuleCategory): string {
  switch (category) {
    case 'language_output':
      return 'language/output rules'
    case 'core_principles':
      return 'core principles'
    case 'agent_collaboration':
      return 'agent collaboration'
    case 'tools_commands':
      return 'tools and commands'
    case 'escalation_decision':
      return 'escalation and decisions'
    case 'memory_context':
      return 'memory and context'
    case 'activation_conditions':
      return 'activation conditions'
    case 'safety_constraints':
      return 'safety constraints'
    default:
      return 'other rules'
  }
}

function buildImports(
  ctx: AppContext,
  fileContents: Array<{ path: string; content: string }>,
): ImportDirective[] {
  const imports: ImportDirective[] = []

  for (const { content, path } of fileContents) {
    const extracted = extractImports(content)
    for (const imp of extracted) {
      const directive = `@${imp.directive}`
      if (imports.some(existing => existing.directive === directive && existing.sourceFile === path && existing.sourceLine === imp.line)) {
        continue
      }

      imports.push({
        directive,
        sourceFile: path,
        sourceLine: imp.line,
        resolvedPath: imp.directive,
        exists: existsSync(ctx.projectContext.resolve(imp.directive)),
      })
    }
  }

  return imports
}

async function collectImportedSources(
  ctx: AppContext,
  imports: ImportDirective[],
): Promise<SourceFileRecord[]> {
  const importedSources: SourceFileRecord[] = []
  const seen = new Set<string>()

  for (const imp of imports) {
    const absPath = ctx.projectContext.resolve(imp.resolvedPath)
    if (!existsSync(absPath) || seen.has(imp.resolvedPath)) {
      continue
    }

    try {
      const content = await readFile(absPath, 'utf-8')
      const fileStat = await stat(absPath)
      importedSources.push({
        path: imp.resolvedPath,
        hash: hashString(content),
        size: content.length,
        lastModified: fileStat.mtime.toISOString(),
      })
      seen.add(imp.resolvedPath)
    } catch {
      // ignore unreadable imports
    }
  }

  return importedSources
}
