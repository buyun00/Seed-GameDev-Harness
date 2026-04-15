import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createPatch } from 'diff'
import type { AppContext } from '../types.js'
import type { ConstitutionRule, ConstitutionAnalysisCache } from '../models/constitution-rule.js'
import type { Proposal } from '../models/proposal.js'
import { hashString } from '../utils/hash.js'
import { extractImports } from '../utils/markdown.js'
import { runConstitutionAnalysisPipeline } from '../core/constitution-analysis-runner.js'
import { agentQuery } from '../worker/agents/base-agent.js'

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
