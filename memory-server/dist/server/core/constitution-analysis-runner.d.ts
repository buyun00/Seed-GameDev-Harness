import type { ConstitutionAnalysisCache } from '../models/constitution-rule.js';
import type { AppContext } from '../types.js';
export interface ConstitutionAnalysisRunnerOptions {
    signal?: AbortSignal;
    onProgress?: (step: string, percent: number, message: string) => void;
    onLog?: (message: string) => void;
}
export declare function runConstitutionAnalysisPipeline(ctx: AppContext, options?: ConstitutionAnalysisRunnerOptions): Promise<ConstitutionAnalysisCache>;
