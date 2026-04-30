import type { AppContext } from '../types.js';
import type { KnowledgeObject } from '../models/knowledge-object.js';
import type { Proposal } from '../models/proposal.js';
export declare class KnowledgeCategorizer {
    private ctx;
    constructor(ctx: AppContext);
    getAll(category?: string): Promise<KnowledgeObject[]>;
    getById(id: string): Promise<(KnowledgeObject & {
        content: string;
    }) | null>;
    proposeDistillation(knowledgeId: string, targetType: 'rule' | 'memory'): Promise<Proposal>;
    private categorize;
    private inferAffinity;
}
