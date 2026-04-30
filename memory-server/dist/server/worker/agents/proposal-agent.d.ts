import type { AppContext } from '../../types.js';
import type { ConstitutionRule } from '../../models/constitution-rule.js';
import type { Proposal } from '../../models/proposal.js';
export interface ProposalEditParams {
    ruleId: string;
    rule: ConstitutionRule;
    changes: {
        title?: string;
        normalizedText?: string;
    };
    editIntent: string;
    currentContent: string;
}
export interface ProposalCreateParams {
    title: string;
    content: string;
    targetFile: string;
    insertAfterSection?: string;
}
export declare function runProposalEdit(ctx: AppContext, params: ProposalEditParams, signal: AbortSignal): Promise<Proposal>;
export declare function runProposalCreate(ctx: AppContext, params: ProposalCreateParams, signal: AbortSignal): Promise<Proposal>;
