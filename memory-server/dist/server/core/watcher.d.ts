import type { ProjectContext } from './project-context.js';
import type { Scanner } from './scanner.js';
import type { SseEmitter } from '../sse/emitter.js';
export declare class Watcher {
    private ctx;
    private scanner;
    private sseEmitter;
    private fsWatcher;
    constructor(ctx: ProjectContext, scanner: Scanner, sseEmitter: SseEmitter);
    start(): void;
    stop(): void;
    private handleChange;
    private inferKind;
}
