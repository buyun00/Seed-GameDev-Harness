import type { SseEmitter } from '../../sse/emitter.js';
import type { Task, TaskType, TaskHandler, TaskStatus } from './task-types.js';
export declare class TaskQueue {
    private sseEmitter;
    private tasks;
    private handlers;
    private queue;
    private processing;
    private abortControllers;
    /** Max number of finished tasks to retain */
    private readonly maxRetained;
    /** How long (ms) to keep finished tasks before they become eligible for eviction */
    private readonly retentionMs;
    private cleanupTimer;
    constructor(sseEmitter: SseEmitter, opts?: {
        maxRetained?: number;
        retentionMs?: number;
    });
    dispose(): void;
    /**
     * Remove finished tasks that exceed retention time or count limit.
     */
    private cleanup;
    registerHandler<TParams, TResult>(type: TaskType, handler: TaskHandler<TParams, TResult>): void;
    enqueue<TParams>(type: TaskType, params: TParams): string;
    getTask(id: string): Task | undefined;
    listTasks(filter?: {
        type?: TaskType;
        status?: TaskStatus;
    }): Task[];
    cancelTask(id: string): boolean;
    /**
     * Submit a task and wait for it to complete (up to timeoutMs).
     * Returns the completed task, or the still-running task if timeout is reached.
     */
    waitForTask<TResult>(taskId: string, timeoutMs?: number): Promise<Task<unknown, TResult>>;
    private processNext;
    private broadcast;
}
