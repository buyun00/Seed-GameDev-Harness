import { agentQuery } from './base-agent.js'
import type { ConstitutionAnalysisCache, ConstitutionRule } from '../../models/constitution-rule.js'
import type { AppContext } from '../../types.js'
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { hashString, stableId } from '../../utils/hash.js'
import { extractImports } from '../../utils/markdown.js'
import type { SourceFileRecord, ImportDirective, Relation } from '../../models/constitution-rule.js'

const ANALYSIS_PROMPT = `You are a rule analysis engine. Analyze the following Claude Code configuration files and extract all rule blocks.

For each rule you MUST provide:
1. originalExcerpt: verbatim copy of the original text from the source file
2. normalizedText: your normalized description of the rule
3. sourceSpan: line numbers + character offsets
4. contextAnchor: 2-3 lines of original text before and after, for writeback anchoring
5. sectionHeading: the markdown heading the rule falls under (if any)

Also detect any @path/to/file import directives.

Output strict JSON only, no markdown fencing:
{
  "rules": [
    {
      "title": "Short rule title",
      "normalizedText": "Normalized rule description",
      "originalExcerpt": "Verbatim text from source",
      "sourceFile": "relative/path.md",
      "sourceSpan": { "startLine": 1, "endLine": 3, "startOffset": 0, "endOffset": 100 },
      "contextAnchor": { "before": "lines before", "after": "lines after", "sectionHeading": "## Heading" },
      "writebackStrategy": "replace",
      "status": "effective",
      "confidence": 0.9,
      "scope": "project-wide",
      "relations": []
    }
  ],
  "imports": [
    { "directive": "@path/to/file", "sourceFile": "CLAUDE.md", "sourceLine": 5, "resolvedPath": "path/to/file" }
  ]
}`

export interface ConstitutionAnalysisParams {
  projectPath: string
}

export async function runConstitutionAnalysis(
  ctx: AppContext,
  _params: ConstitutionAnalysisParams,
  signal: AbortSignal,
): Promise<ConstitutionAnalysisCache> {
  const sourceFiles = ctx.projectContext.constitutionFiles
  const sources: SourceFileRecord[] = []
  const fileContents: Array<{ path: string; content: string }> = []

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
  }

  let promptBody = ''
  for (const { path, content } of fileContents) {
    promptBody += `\n--- ${path} ---\n${content}\n`
  }

  const fullPrompt = ANALYSIS_PROMPT + '\n\nFiles to analyze:\n' + promptBody

  const rawResult = await agentQuery({
    prompt: fullPrompt,
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 180_000,
    signal,
    disallowedTools: [
      'Write', 'Edit', 'MultiEdit', 'Shell',
      'WebFetch', 'WebSearch', 'TodoWrite',
    ],
  })

  let parsed: { rules: ConstitutionRule[]; imports?: Array<{ directive: string; sourceFile: string; sourceLine: number; resolvedPath: string }> }
  try {
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResult)
  } catch {
    parsed = { rules: [], imports: [] }
  }

  const rules = parsed.rules.map((r, i) => ({
    ...r,
    id: r.id || stableId(`rule-${r.sourceFile}-${r.sourceSpan?.startLine ?? i}`),
  }))

  const imports: ImportDirective[] = []
  for (const { content, path } of fileContents) {
    const extracted = extractImports(content)
    for (const imp of extracted) {
      imports.push({
        directive: `@${imp.directive}`,
        sourceFile: path,
        sourceLine: imp.line,
        resolvedPath: imp.directive,
        exists: existsSync(ctx.projectContext.resolve(imp.directive)),
      })
    }
  }
  if (parsed.imports) {
    for (const imp of parsed.imports) {
      if (!imports.find(i => i.directive === imp.directive && i.sourceFile === imp.sourceFile)) {
        imports.push({ ...imp, exists: existsSync(ctx.projectContext.resolve(imp.resolvedPath)) })
      }
    }
  }

  const importedSources: SourceFileRecord[] = []
  for (const imp of imports) {
    const absPath = ctx.projectContext.resolve(imp.resolvedPath)
    if (existsSync(absPath)) {
      try {
        const content = await readFile(absPath, 'utf-8')
        const fileStat = await stat(absPath)
        importedSources.push({
          path: imp.resolvedPath,
          hash: hashString(content),
          size: content.length,
          lastModified: fileStat.mtime.toISOString(),
        })
      } catch { /* skip */ }
    }
  }

  const allRelations: Relation[] = rules.flatMap(r => r.relations || [])
  const summary = {
    effective: rules.filter(r => r.status === 'effective').length,
    shadowed: rules.filter(r => r.status === 'shadowed').length,
    conflicting: rules.filter(r => r.status === 'conflicting').length,
    unresolved: rules.filter(r => r.status === 'unresolved').length,
    total: rules.length,
  }

  return {
    version: 2,
    analyzedAt: new Date().toISOString(),
    sources,
    importedSources,
    imports,
    rules,
    relations: allRelations,
    statusSummary: summary,
    rawAnalysis: rawResult,
  }
}
