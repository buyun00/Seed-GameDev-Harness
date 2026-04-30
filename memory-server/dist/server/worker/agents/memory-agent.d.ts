import type { AppContext } from '../../types.js';
export interface MemoryAnalysisParams {
    memoryId: string;
    changes: Record<string, unknown>;
}
export declare function runMemoryAnalysis(ctx: AppContext, params: MemoryAnalysisParams, signal: AbortSignal): Promise<string>;
