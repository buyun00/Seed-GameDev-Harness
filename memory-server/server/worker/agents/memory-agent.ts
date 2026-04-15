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
  const prompt = `Analyze and apply the following changes to a memory topic file.
Changes: ${JSON.stringify(params.changes)}

Provide the optimized file content. Output raw content only, no markdown fencing.`

  return agentQuery({
    prompt,
    cwd: ctx.projectContext.projectRoot,
    timeoutMs: 120_000,
    signal,
    disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
  })
}
