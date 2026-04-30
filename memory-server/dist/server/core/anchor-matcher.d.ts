import type { ConstitutionRule } from '../models/constitution-rule.js';
export interface MatchResult {
    found: boolean;
    offset?: number;
    line?: number;
    reason?: string;
    shifted?: boolean;
}
export declare class AnchorMatcher {
    match(rule: ConstitutionRule, currentContent: string): MatchResult;
    private exactMatch;
    private fuzzyMatch;
}
