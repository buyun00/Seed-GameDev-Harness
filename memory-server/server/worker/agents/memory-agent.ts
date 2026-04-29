import { agentQuery } from './base-agent.js'
import type { AppContext } from '../../types.js'

export interface MemoryAnalysisParams {
  memoryId: string
  changes: Record<string, unknown>
}

export async function runMemoryAnalysis(
  ctx: AppContext,
  params: MemoryAnalysisParams,
  signal: AbortSignal,
): Promise<string> {
  function emitLog(message: string) {
    process.stderr.write(`[Memory] ${message}\n`)
    ctx.sseEmitter.emit('agent:log', { source: 'memory', message, ts: Date.now() })
  }

  const prompt = `Analyze and apply the following changes to a memory topic file.
Changes: ${JSON.stringify(params.changes)}

Provide the optimized file content. Output raw content only, no markdown fencing.`

  emitLog(`Analyzing memory changes for: "${params.memoryId}"`)

  const result = await agentQuery({
    prompt,
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 120_000,
    signal,
    disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
    label: 'Memory',
    onLog: emitLog,
  })

  emitLog('Memory analysis complete')
  return result
}
