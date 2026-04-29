import { agentQuery } from './base-agent.js'
import type { AppContext } from '../../types.js'

export interface KnowledgeDistillParams {
  content: string
  title: string
  targetType: 'rule' | 'memory'
}

export async function runKnowledgeDistill(
  ctx: AppContext,
  params: KnowledgeDistillParams,
  signal: AbortSignal,
): Promise<string> {
  function emitLog(message: string) {
    process.stderr.write(`[Knowledge] ${message}\n`)
    ctx.sseEmitter.emit('agent:log', { source: 'knowledge', message, ts: Date.now() })
  }

  const prompt = params.targetType === 'rule'
    ? `Distill the following document into a concise rule suitable for .claude/rules/. Create a markdown file with appropriate frontmatter (paths if applicable). Source document:\n\n${params.content}\n\nOutput the complete rule file content, no fencing.`
    : `Distill the following document into a concise memory note. Source document:\n\n${params.content}\n\nOutput the complete memory file content, no fencing.`

  emitLog(`Starting ${params.targetType} distillation: "${params.title}"`)

  const result = await agentQuery({
    prompt,
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 120_000,
    signal,
    disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
    label: 'Knowledge',
    onLog: emitLog,
  })

  emitLog(`Distillation complete: "${params.title}"`)
  return result
}
