import type { SseEvent, SseEventType } from './events.js'

type Listener = (event: SseEvent) => void

export class SseEmitter {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit(type: SseEventType, data: Record<string, unknown> = {}) {
    const event: SseEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
    }
    for (const listener of this.listeners) {
      try { listener(event) } catch { /* ignore */ }
    }
  }

  get clientCount() {
    return this.listeners.size
  }
}
