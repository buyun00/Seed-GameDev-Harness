import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { AppContext } from '../types.js'
import type {
  ConstitutionRule,
  ConstitutionAnalysisCache,
  SourceFileRecord,
  ImportDirective,
  Relation,
} from '../models/constitution-rule.js'
import type { Proposal } from '../models/proposal.js'
import { hashString, stableId } from '../utils/hash.js'
import { extractImports } from '../utils/markdown.js'
import { createPatch } from 'diff'
import { agentQuery } from '../worker/agents/base-agent.js'

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
      const task = await this.ctx.taskQueue.waitForTask<ConstitutionAnalysisCache>(taskId, 180_000)
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
    const sourceFiles = this.ctx.projectContext.constitutionFiles
    const sources: SourceFileRecord[] = []
    const fileContents: Array<{ path: string; content: string }> = []

    for (const absPath of sourceFiles) {
      const content = await readFile(absPath, 'utf-8')
      const fileStat = await stat(absPath)
      const relPath = this.ctx.projectContext.relative(absPath)
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
      cwd: this.ctx.projectContext.projectRoot,
      timeoutMs: 180_000,
    })

    return this.parseAnalysisResult(rawResult, sources, fileContents)
  }

  private parseAnalysisResult(
    rawResult: string,
    sources: SourceFileRecord[],
    fileContents: Array<{ path: string; content: string }>,
  ): ConstitutionAnalysisCache {
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
          exists: existsSync(this.ctx.projectContext.resolve(imp.directive)),
        })
      }
    }
    if (parsed.imports) {
      for (const imp of parsed.imports) {
        if (!imports.find(i => i.directive === imp.directive && i.sourceFile === imp.sourceFile)) {
          imports.push({ ...imp, exists: existsSync(this.ctx.projectContext.resolve(imp.resolvedPath)) })
        }
      }
    }

    const importedSources: SourceFileRecord[] = []

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
            ci => ci.resolvedPath === imp.directive && ci.sourceFile === this.ctx.projectContext.relative(absPath)
          )
          if (!exists) {
            changed.push(`[new import] @${imp.directive}`)
          }
        }
      } catch { /* skip */ }
    }

    return { fresh: changed.length === 0, changedFiles: changed }
  }

  async proposeEdit(
    rule: ConstitutionRule,
    changes: { title?: string; normalizedText?: string },
    editIntent: string,
    currentContent: string,
  ): Promise<Proposal> {
    const prompt = `You are editing a Claude Code configuration file. The file content is:

\`\`\`
${currentContent}
\`\`\`

I need to modify the following rule block (located around line ${rule.sourceSpan.startLine}):
Original text: "${rule.originalExcerpt}"

Edit intent: ${editIntent}
${changes.title ? `New title: ${changes.title}` : ''}
${changes.normalizedText ? `New rule text: ${changes.normalizedText}` : ''}

Output the COMPLETE modified file content. Only modify the targeted rule block. Do not change anything else.
Output raw file content only, no markdown fencing.`

    const result = await agentQuery({
      prompt,
      cwd: this.ctx.projectContext.projectRoot,
      timeoutMs: 120_000,
    })

    const proposedContent = result.trim()
    const diff = createPatch(rule.sourceFile, currentContent, proposedContent, 'original', 'proposed')

    const proposal: Proposal = {
      id: randomUUID(),
      type: 'constitution_edit',
      source: `Edit rule: ${rule.title}`,
      affectedFiles: [{
        path: rule.sourceFile,
        action: 'modify',
        diff,
        originalContent: currentContent,
        proposedContent,
      }],
      summary: `Edit constitution rule "${rule.title}": ${editIntent}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
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
}
