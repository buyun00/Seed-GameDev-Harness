import type { AppContext } from '../../types.js';
export interface KnowledgeDistillParams {
    content: string;
    title: string;
    targetType: 'rule' | 'memory';
}
export declare function runKnowledgeDistill(ctx: AppContext, params: KnowledgeDistillParams, signal: AbortSignal): Promise<string>;
