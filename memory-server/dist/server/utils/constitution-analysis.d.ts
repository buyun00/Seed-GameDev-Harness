import type { ConstitutionRule, ConstitutionRuleCategory } from '../models/constitution-rule.js';
export interface ConstitutionFileInput {
    path: string;
    content: string;
}
export declare function buildConstitutionFilePrompt(file: ConstitutionFileInput): string;
export declare function buildConstitutionComparisonPrompt(category: ConstitutionRuleCategory, rules: ConstitutionRule[]): string;
export declare function parseConstitutionAnalysisResult(rawResult: string, file: ConstitutionFileInput): ConstitutionRule[];
export declare function parseConstitutionComparisonResult(rawResult: string, extractedRules: ConstitutionRule[]): ConstitutionRule[];
export declare function summarizeConstitutionRules(rules: ConstitutionRule[]): {
    effective: number;
    shadowed: number;
    conflicting: number;
    unresolved: number;
    total: number;
};
export declare function finalizeComparedRules(rules: ConstitutionRule[]): ConstitutionRule[];
