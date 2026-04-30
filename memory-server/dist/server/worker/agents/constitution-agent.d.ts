import type { ConstitutionAnalysisCache } from '../../models/constitution-rule.js';
import type { AppContext } from '../../types.js';
export interface ConstitutionAnalysisParams {
    projectPath: string;
}
export declare function runConstitutionAnalysis(ctx: AppContext, _params: ConstitutionAnalysisParams, signal: AbortSignal): Promise<ConstitutionAnalysisCache>;
