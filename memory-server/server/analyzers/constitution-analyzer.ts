import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createPatch } from 'diff'
import type { AppContext } from '../types.js'
import type {
  ConstitutionRule,
  ConstitutionRuleCategory,
  ConstitutionAnalysisCache,
  ImportDirective,
  SourceFileRecord,
} from '../models/constitution-rule.js'
import type { Proposal } from '../models/proposal.js'
import { hashString } from '../utils/hash.js'
import { extractImports } from '../utils/markdown.js'
import { runConstitutionAnalysisPipeline } from '../core/constitution-analysis-runner.js'
import { agentQuery } from '../worker/agents/base-agent.js'
import {
  finalizeComparedRules,
  parseConstitutionAnalysisResult,
  summarizeConstitutionRules,
} from '../utils/constitution-analysis.js'

export class ConstitutionAnalyzer {
  constructor(private ctx: AppContext) {}

  /**
   * Run analysis. If taskQueue is available, submits as a background task
   * and waits (sync wrapper). Otherwise falls back to direct invocation.
   */
  async analyze(): Promise<ConstitutionAnalysisCache> {
    if (this.ctx.taskQueue) {
      const taskId = this.ctx.taskQueue.enqueue('constitution_analysis', {
        projectPath: this.ctx.projectContext.projectRoot,
      })
      const task = await this.ctx.taskQueue.waitForTask<ConstitutionAnalysisCache>(taskId, 600_000)
      if (task.status === 'completed' && task.result) {
        return task.result
      }
      if (task.status === 'failed') {
        throw new Error(task.error || 'Constitution analysis failed')
      }
      throw new Error('Constitution analysis timed out')
    }

    return this.directAnalyze()
  }

  private async directAnalyze(): Promise<ConstitutionAnalysisCache> {
    return runConstitutionAnalysisPipeline(this.ctx)
  }

  async checkFreshness(cached: ConstitutionAnalysisCache): Promise<{ fresh: boolean; changedFiles: string[] }> {
    const changed: string[] = []

    for (const src of cached.sources) {
      const absPath = this.ctx.projectContext.resolve(src.path)
      if (!existsSync(absPath)) {
        changed.push(src.path)
        continue
      }
      const content = await readFile(absPath, 'utf-8')
      if (hashString(content) !== src.hash) {
        changed.push(src.path)
      }
    }

    for (const src of cached.importedSources) {
      const absPath = this.ctx.projectContext.resolve(src.path)
      if (!existsSync(absPath)) {
        changed.push(src.path)
        continue
      }
      const content = await readFile(absPath, 'utf-8')
      if (hashString(content) !== src.hash) {
        changed.push(src.path)
      }
    }

    const currentConstitutionFiles = this.ctx.projectContext.constitutionFiles
    for (const absPath of currentConstitutionFiles) {
      try {
        const content = await readFile(absPath, 'utf-8')
        const currentImports = extractImports(content)
        for (const imp of currentImports) {
          const exists = cached.imports.some(
            ci => ci.resolvedPath === imp.directive && ci.sourceFile === this.ctx.projectContext.relative(absPath),
          )
          if (!exists) {
            changed.push(`[new import] @${imp.directive}`)
          }
        }
      } catch {
        // skip unreadable file
      }
    }

    return { fresh: changed.length === 0, changedFiles: changed }
  }

  async proposeEdit(
    rule: ConstitutionRule,
    changes: {
      category: ConstitutionRuleCategory
      normalizedText: string
      scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
      scopeDescription: string
    },
    cached: ConstitutionAnalysisCache,
  ): Promise<Proposal> {
    const editableFiles = await Promise.all(
      this.ctx.projectContext.constitutionFiles.map(async (absPath) => {
        const path = this.ctx.projectContext.relative(absPath)
        return {
          path,
          content: await readFile(absPath, 'utf-8'),
        }
      }),
    )

    const prompt = `You are editing one or more Claude Code constitution files.

Primary selected rule:
${JSON.stringify({
  id: rule.id,
  sourceFile: rule.sourceFile,
  sourceSpan: rule.sourceSpan,
  category: rule.category,
  normalizedText: rule.normalizedText,
  originalExcerpt: rule.originalExcerpt,
}, null, 2)}

Requested target category: ${changes.category}
Requested rule content:
${changes.normalizedText}

Requested scope mode: ${changes.scopeMode}
Requested scope description:
${changes.scopeDescription}

Existing extracted rules:
${JSON.stringify(cached.rules.map(item => ({
  id: item.id,
  sourceFile: item.sourceFile,
  category: item.category,
  status: item.status,
  normalizedText: item.normalizedText,
})), null, 2)}

Editable constitution files:
${JSON.stringify(editableFiles, null, 2)}

Modify the files according to the request. Return strict JSON only:
{
  "summary": "short summary",
  "files": [
    {
      "path": "CLAUDE.md",
      "content": "complete modified file content",
      "extractedRules": [
        "L10-10 :: core_principles :: 核心原则 :: 事实必须分散流动，方向必须集中裁决"
      ]
    }
  ]
}

Rules:
- Include only files that actually changed.
- path must be one of the editable file paths provided above.
- content must be the COMPLETE file content after modification.
- extractedRules must list ALL extracted rules for that changed file after modification, using the exact extraction line format.
- Do not wrap the JSON in markdown fences.
- Do not add prose before or after the JSON object.`

    const result = await agentQuery({
      prompt,
      cwd: this.ctx.projectContext.projectRoot,
      timeoutMs: 120_000,
    })

    const parsed = this.parseProposalEditResult(result, editableFiles)
    const affectedFiles = parsed.files.map(file => {
      const original = editableFiles.find(candidate => candidate.path === file.path)?.content ?? ''
      return {
        path: file.path,
        action: original ? 'modify' as const : 'create' as const,
        diff: createPatch(file.path, original, file.content, 'original', 'proposed'),
        originalContent: original || undefined,
        proposedContent: file.content,
      }
    })

    const proposal: Proposal = {
      id: randomUUID(),
      type: 'constitution_edit',
      source: `Edit rule: ${rule.normalizedText}`,
      affectedFiles,
      summary: parsed.summary || `Edit constitution rule: ${rule.normalizedText}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      constitutionPatch: {
        files: parsed.files.map(file => ({
          path: file.path,
          rules: parseConstitutionAnalysisResult(
            file.extractedRules.join('\n'),
            { path: file.path, content: file.content },
          ),
        })),
      },
    }

    await this.saveProposal(proposal)
    return proposal
  }

  async proposeCreate(params: {
    title: string
    content: string
    targetFile: string
    insertAfterSection?: string
  }): Promise<Proposal> {
    const absPath = this.ctx.projectContext.resolve(params.targetFile)
    let currentContent = ''
    if (existsSync(absPath)) {
      currentContent = await readFile(absPath, 'utf-8')
    }

    const prompt = `You are editing a Claude Code configuration file. Current content:

\`\`\`
${currentContent}
\`\`\`

Add a new rule block:
Title: ${params.title}
Content: ${params.content}
${params.insertAfterSection ? `Insert after section: ${params.insertAfterSection}` : 'Append to the end of the file.'}

Output the COMPLETE modified file content. Output raw file content only, no markdown fencing.`

    const result = await agentQuery({
      prompt,
      cwd: this.ctx.projectContext.projectRoot,
      timeoutMs: 120_000,
    })

    const proposedContent = result.trim()
    const diff = createPatch(params.targetFile, currentContent, proposedContent, 'original', 'proposed')

    const proposal: Proposal = {
      id: randomUUID(),
      type: 'constitution_create',
      source: `New rule: ${params.title}`,
      affectedFiles: [{
        path: params.targetFile,
        action: currentContent ? 'modify' : 'create',
        diff,
        originalContent: currentContent || undefined,
        proposedContent,
      }],
      summary: `Create new constitution rule: "${params.title}"`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    await this.saveProposal(proposal)
    return proposal
  }

  private async saveProposal(proposal: Proposal) {
    const filePath = `${this.ctx.projectContext.proposalsDir}/${proposal.id}.json`
    await this.ctx.writer.write(filePath, JSON.stringify(proposal, null, 2))
    this.ctx.sseEmitter.emit('proposal:created', { id: proposal.id, type: proposal.type })
  }

  async refreshCachedAnalysisFromProposal(proposal: Proposal): Promise<void> {
    if (!proposal.constitutionPatch?.files?.length) return

    const cached = await this.ctx.cache.get<ConstitutionAnalysisCache>('constitution-analysis')
    if (!cached) return

    const changedPaths = new Set(proposal.constitutionPatch.files.map(file => file.path))
    const previousRules = cached.rules.filter(rule => changedPaths.has(rule.sourceFile))
    const previousRuleIds = new Set(previousRules.map(rule => rule.id))
    const previousCategories = new Set(previousRules.map(rule => rule.category))

    const untouchedRules = cached.rules
      .filter(rule => !changedPaths.has(rule.sourceFile))
      .map(rule => {
        const filteredRelations = rule.relations.filter(relation => !previousRuleIds.has(relation.targetRuleId))
        const touchedByPatch = filteredRelations.length !== rule.relations.length || previousCategories.has(rule.category)
        return touchedByPatch
          ? { ...rule, status: 'unresolved' as const, relations: filteredRelations }
          : rule
      })

    const patchedRules = proposal.constitutionPatch.files.flatMap(file => file.rules)
    const rules = finalizeComparedRules([...untouchedRules, ...patchedRules])

    const sources = await this.buildUpdatedSources(cached.sources)
    const imports = cached.imports
    const importedSources = cached.importedSources
    const statusSummary = summarizeConstitutionRules(rules)

    await this.ctx.cache.set('constitution-analysis', {
      ...cached,
      analyzedAt: new Date().toISOString(),
      sources,
      imports,
      importedSources,
      rules,
      relations: rules.flatMap(current => current.relations),
      statusSummary,
    })
  }

  private parseProposalEditResult(
    rawResult: string,
    editableFiles: Array<{ path: string; content: string }>,
  ): { summary: string; files: Array<{ path: string; content: string; extractedRules: string[] }> } {
    const parsed = this.tryParseObject(rawResult)
    if (!parsed) {
      throw new Error('Proposal generation returned invalid JSON')
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''
    const files = Array.isArray(parsed.files) ? parsed.files : []
    const allowedPaths = new Set(editableFiles.map(file => file.path))

    const normalizedFiles = files
      .map(file => this.normalizeProposalEditFile(file, allowedPaths))
      .filter((file): file is { path: string; content: string; extractedRules: string[] } => file !== null)

    if (normalizedFiles.length === 0) {
      throw new Error('Proposal generation returned no changed files')
    }

    return { summary, files: normalizedFiles }
  }

  private normalizeProposalEditFile(
    rawFile: unknown,
    allowedPaths: Set<string>,
  ): { path: string; content: string; extractedRules: string[] } | null {
    if (!rawFile || typeof rawFile !== 'object') return null
    const record = rawFile as Record<string, unknown>
    const path = typeof record.path === 'string' ? record.path.trim() : ''
    const content = typeof record.content === 'string' ? record.content : ''
    const extractedRules = Array.isArray(record.extractedRules)
      ? record.extractedRules.filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
      : []

    if (!path || !allowedPaths.has(path) || !content.trim() || extractedRules.length === 0) {
      return null
    }

    return {
      path,
      content: content.trimEnd(),
      extractedRules,
    }
  }

  private tryParseObject(raw: string): Record<string, unknown> | null {
    const candidates = new Set<string>()
    const trimmed = raw.trim()
    if (trimmed) candidates.add(trimmed)

    const fencedMatches = raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)
    for (const match of fencedMatches) {
      if (match[1]?.trim()) candidates.add(match[1].trim())
    }

    const balanced = this.extractBalancedJsonObject(raw)
    if (balanced) candidates.add(balanced)

    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>
        }
      } catch {
        // ignore invalid candidate
      }
    }

    return null
  }

  private extractBalancedJsonObject(raw: string): string | null {
    let start = -1
    let depth = 0
    let inString = false
    let escaped = false

    for (let index = 0; index < raw.length; index++) {
      const char = raw[index]
      if (start === -1) {
        if (char === '{') {
          start = index
          depth = 1
        }
        continue
      }
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === '"') {
        inString = !inString
        continue
      }
      if (inString) continue
      if (char === '{') depth++
      if (char === '}') depth--
      if (depth === 0) {
        return raw.slice(start, index + 1)
      }
    }

    return null
  }

  private async buildUpdatedSources(previousSources: SourceFileRecord[]): Promise<SourceFileRecord[]> {
    const next: SourceFileRecord[] = []

    for (const source of previousSources) {
      const absPath = this.ctx.projectContext.resolve(source.path)
      if (!existsSync(absPath)) continue
      const content = await readFile(absPath, 'utf-8')
      const fileStat = await stat(absPath)
      next.push({
        path: source.path,
        hash: hashString(content),
        size: content.length,
        lastModified: fileStat.mtime.toISOString(),
      })
    }

    return next
  }
}
