import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createPatch } from 'diff'
import { agentQuery } from './base-agent.js'
import type { AppContext } from '../../types.js'
import type { ConstitutionRule } from '../../models/constitution-rule.js'
import type { Proposal } from '../../models/proposal.js'

export interface ProposalEditParams {
  ruleId: string
  rule: ConstitutionRule
  changes: { title?: string; normalizedText?: string }
  editIntent: string
  currentContent: string
}

export interface ProposalCreateParams {
  title: string
  content: string
  targetFile: string
  insertAfterSection?: string
}

export async function runProposalEdit(
  ctx: AppContext,
  params: ProposalEditParams,
  signal: AbortSignal,
): Promise<Proposal> {
  function emitLog(message: string) {
    process.stderr.write(`[Proposal] ${message}\n`)
    ctx.sseEmitter.emit('agent:log', { source: 'proposal', message, ts: Date.now() })
  }

  const { rule, changes, editIntent, currentContent } = params

  emitLog(`Starting proposal: edit rule "${rule.title}"`)

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
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 120_000,
    signal,
    disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
    label: 'Proposal',
    onLog: emitLog,
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

  await saveProposal(ctx, proposal)
  return proposal
}

export async function runProposalCreate(
  ctx: AppContext,
  params: ProposalCreateParams,
  signal: AbortSignal,
): Promise<Proposal> {
  function emitLog(message: string) {
    process.stderr.write(`[Proposal] ${message}\n`)
    ctx.sseEmitter.emit('agent:log', { source: 'proposal', message, ts: Date.now() })
  }

  const absPath = ctx.projectContext.resolve(params.targetFile)
  let currentContent = ''
  if (existsSync(absPath)) {
    currentContent = await readFile(absPath, 'utf-8')
  }

  emitLog(`Starting proposal: create rule "${params.title}"`)

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
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 120_000,
    signal,
    disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
    label: 'Proposal',
    onLog: emitLog,
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

  await saveProposal(ctx, proposal)
  return proposal
}

async function saveProposal(ctx: AppContext, proposal: Proposal) {
  const filePath = `${ctx.projectContext.proposalsDir}/${proposal.id}.json`
  await ctx.writer.write(filePath, JSON.stringify(proposal, null, 2))
  ctx.sseEmitter.emit('proposal:created', { id: proposal.id, type: proposal.type })
}
