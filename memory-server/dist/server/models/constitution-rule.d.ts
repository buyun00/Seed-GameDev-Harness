export type ConstitutionRuleCategory = 'language_output' | 'core_principles' | 'agent_collaboration' | 'tools_commands' | 'escalation_decision' | 'memory_context' | 'activation_conditions' | 'safety_constraints' | 'other';
export interface ConstitutionRule {
    id: string;
    title: string;
    category: ConstitutionRuleCategory;
    normalizedText: string;
    originalExcerpt: string;
    sourceFile: string;
    sourceSpan: {
        startLine: number;
        endLine: number;
        startOffset: number;
        endOffset: number;
    };
    contextAnchor: {
        before: string;
        after: string;
        sectionHeading?: string;
    };
    writebackStrategy: 'replace' | 'insert_after' | 'append_to_section';
    status: 'effective' | 'shadowed' | 'conflicting' | 'unresolved';
    relations: Relation[];
    scope?: string;
}
export interface Relation {
    type: 'shadowed_by' | 'conflicts_with' | 'overlaps_with' | 'reinforced_by' | 'more_specific_than' | 'likely_supersedes';
    targetRuleId: string;
    description: string;
}
export interface SourceFileRecord {
    path: string;
    hash: string;
    size: number;
    lastModified: string;
}
export interface ImportDirective {
    directive: string;
    sourceFile: string;
    sourceLine: number;
    resolvedPath: string;
    exists: boolean;
}
export interface ConstitutionAnalysisCache {
    version: 2;
    analyzedAt: string;
    sources: SourceFileRecord[];
    importedSources: SourceFileRecord[];
    imports: ImportDirective[];
    rules: ConstitutionRule[];
    relations: Relation[];
    statusSummary: {
        effective: number;
        shadowed: number;
        conflicting: number;
        unresolved: number;
        total: number;
    };
    rawAnalysis?: string;
}
