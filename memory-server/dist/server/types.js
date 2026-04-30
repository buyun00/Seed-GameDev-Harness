export class SessionStore {
    sessions = new Map();
    cleanupTimer = null;
    ttlMs;
    constructor(ttlMs = 24 * 60 * 60 * 1000) {
        this.ttlMs = ttlMs;
        this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
        if (this.cleanupTimer.unref)
            this.cleanupTimer.unref();
    }
    add(token) {
        const now = Date.now();
        this.sessions.set(token, { createdAt: now, expiresAt: now + this.ttlMs });
    }
    validate(token) {
        const entry = this.sessions.get(token);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.sessions.delete(token);
            return false;
        }
        return true;
    }
    has(token) {
        return this.validate(token);
    }
    delete(token) {
        return this.sessions.delete(token);
    }
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.sessions.clear();
    }
    cleanup() {
        const now = Date.now();
        for (const [token, entry] of this.sessions) {
            if (now > entry.expiresAt) {
                this.sessions.delete(token);
            }
        }
    }
}
