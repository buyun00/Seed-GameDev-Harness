import type { ConstitutionAnalysisCache } from '../../models/constitution-rule.js'
import type { AppContext } from '../../types.js'
import { runConstitutionAnalysisPipeline } from '../../core/constitution-analysis-runner.js'
import { emitAgentLog } from './agent-utils.js'

export interface ConstitutionAnalysisParams {
  projectPath: string
}

export async function runConstitutionAnalysis(
  ctx: AppContext,
  _params: ConstitutionAnalysisParams,
  signal: AbortSignal,
): Promise<ConstitutionAnalysisCache> {
  function emitProgress(step: string, percent: number, message: string) {
    process.stderr.write(`[Constitution] ${message}\n`)
    ctx.sseEmitter.emit('analysis:progress', { step, percent, message, ts: Date.now() })
  }

  const result = await runConstitutionAnalysisPipeline(ctx, {
    signal,
    onProgress: emitProgress,
    onLog: (msg) => emitAgentLog(ctx.sseEmitter, 'constitution', msg),
  })

  await ctx.cache.set('constitution-analysis', result)
  ctx.sseEmitter.emit('analysis:complete', {
    rulesCount: result.rules.length,
    analyzedAt: result.analyzedAt,
  })

  emitAgentLog(
    ctx.sseEmitter, 'constitution',
    `Analysis complete: ${result.rules.length} rule(s) `
    + `(effective ${result.statusSummary.effective}, conflicting ${result.statusSummary.conflicting}, unresolved ${result.statusSummary.unresolved})`,
  )

  return result
}
