import type { SseEvent, SseEventType } from './events.js';
type Listener = (event: SseEvent) => void;
export declare class SseEmitter {
    private listeners;
    subscribe(listener: Listener): () => void;
    emit(type: SseEventType, data?: Record<string, unknown>): void;
    get clientCount(): number;
}
export {};
