import type { SseEmitter } from '../sse/emitter.js';
export type AgentId = 'leader' | 'builder' | 'researcher' | 'reviewer' | 'unity-pilot' | 'chat';
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'completed' | 'error';
export interface AgentState {
    id: AgentId;
    name: string;
    role: string;
    status: AgentStatus;
    currentTask: string;
    progress: string;
    startedAt: string | null;
    updatedAt: string;
    emoji: string;
}
export declare class AgentStatusManager {
    private agents;
    private sseEmitter;
    private taskQueue;
    constructor(sseEmitter: SseEmitter);
    getAgent(id: AgentId): AgentState | undefined;
    getAllAgents(): AgentState[];
    setStatus(id: AgentId, status: AgentStatus, task?: string): void;
    setTask(id: AgentId, task: string): void;
    setProgress(id: AgentId, progress: string): void;
    enqueueTask(agentId: AgentId, task: string): void;
    startWork(agentId: AgentId, task: string): void;
    completeWork(agentId: AgentId, result?: string): void;
    failWork(agentId: AgentId, error: string): void;
    private processQueue;
    getQueueLength(agentId: AgentId): number;
    private broadcast;
}
