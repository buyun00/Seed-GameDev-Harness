export type TaskType = 'constitution_analysis' | 'proposal_generation' | 'proposal_create' | 'memory_analysis' | 'knowledge_distill';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface Task<TParams = unknown, TResult = unknown> {
    id: string;
    type: TaskType;
    status: TaskStatus;
    params: TParams;
    result?: TResult;
    error?: string;
    progress?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
}
export interface TaskHandler<TParams = unknown, TResult = unknown> {
    (params: TParams, signal: AbortSignal): Promise<TResult>;
}
