import type { Scanner } from './core/scanner.js';
import type { Watcher } from './core/watcher.js';
import type { Cache } from './core/cache.js';
import type { Writer } from './core/writer.js';
import type { ProjectContext } from './core/project-context.js';
import type { SseEmitter } from './sse/emitter.js';
import type { TaskQueue } from './worker/queue/task-queue.js';
import type { LlmProvider } from './core/llm-provider.js';
import type { AgentStatusManager } from './worker/agent-status-manager.js';
import type { SettingsStore } from './core/settings-store.js';
export declare class SessionStore {
    private sessions;
    private cleanupTimer;
    private readonly ttlMs;
    constructor(ttlMs?: number);
    add(token: string): void;
    validate(token: string): boolean;
    has(token: string): boolean;
    delete(token: string): boolean;
    dispose(): void;
    private cleanup;
}
export interface AppContext {
    projectContext: ProjectContext;
    scanner: Scanner;
    watcher: Watcher;
    cache: Cache;
    writer: Writer;
    sseEmitter: SseEmitter;
    sessionStore: SessionStore;
    startedAt: number;
    shutdownFn?: () => Promise<void>;
    taskQueue?: TaskQueue;
    llmProvider: LlmProvider;
    agentStatusManager: AgentStatusManager;
    settingsStore: SettingsStore;
}
