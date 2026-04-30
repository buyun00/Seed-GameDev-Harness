import type { AppContext } from '../types.js';
import type { ConstitutionRule, ConstitutionRuleCategory, ConstitutionAnalysisCache } from '../models/constitution-rule.js';
import type { Proposal } from '../models/proposal.js';
export declare class ConstitutionAnalyzer {
    private ctx;
    constructor(ctx: AppContext);
    /**
     * Run analysis. If taskQueue is available, submits as a background task
     * and waits (sync wrapper). Otherwise falls back to direct invocation.
     */
    analyze(): Promise<ConstitutionAnalysisCache>;
    private directAnalyze;
    checkFreshness(cached: ConstitutionAnalysisCache): Promise<{
        fresh: boolean;
        changedFiles: string[];
    }>;
    proposeEdit(rule: ConstitutionRule, changes: {
        category: ConstitutionRuleCategory;
        normalizedText: string;
        scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom';
        scopeDescription: string;
    }, cached: ConstitutionAnalysisCache): Promise<Proposal>;
    proposeCreate(params: {
        title: string;
        content: string;
        targetFile: string;
        insertAfterSection?: string;
    }): Promise<Proposal>;
    private saveProposal;
    refreshCachedAnalysisFromProposal(proposal: Proposal): Promise<void>;
    private parseProposalEditResult;
    private normalizeProposalEditFile;
    private tryParseObject;
    private extractBalancedJsonObject;
    private buildUpdatedSources;
}
