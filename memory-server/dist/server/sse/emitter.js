export class SseEmitter {
    listeners = new Set();
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    emit(type, data = {}) {
        const event = {
            type,
            data,
            timestamp: new Date().toISOString(),
        };
        for (const listener of this.listeners) {
            try {
                listener(event);
            }
            catch { /* ignore */ }
        }
    }
    get clientCount() {
        return this.listeners.size;
    }
}
