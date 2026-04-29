import type { Scanner } from './core/scanner.js'
import type { Watcher } from './core/watcher.js'
import type { Cache } from './core/cache.js'
import type { Writer } from './core/writer.js'
import type { ClaudeAdapter } from './core/claude-adapter.js'
import type { ProjectContext } from './core/project-context.js'
import type { SseEmitter } from './sse/emitter.js'
import type { TaskQueue } from './worker/queue/task-queue.js'

interface SessionEntry {
  createdAt: number
  expiresAt: number
}

export class SessionStore {
  private sessions = new Map<string, SessionEntry>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private readonly ttlMs: number

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000)
    if (this.cleanupTimer.unref) this.cleanupTimer.unref()
  }

  add(token: string): void {
    const now = Date.now()
    this.sessions.set(token, { createdAt: now, expiresAt: now + this.ttlMs })
  }

  validate(token: string): boolean {
    const entry = this.sessions.get(token)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(token)
      return false
    }
    return true
  }

  has(token: string): boolean {
    return this.validate(token)
  }

  delete(token: string): boolean {
    return this.sessions.delete(token)
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.sessions.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [token, entry] of this.sessions) {
      if (now > entry.expiresAt) {
        this.sessions.delete(token)
      }
    }
  }
}

export interface AppContext {
  projectContext: ProjectContext
  scanner: Scanner
  watcher: Watcher
  cache: Cache
  writer: Writer
  sseEmitter: SseEmitter
  claudeAdapter: ClaudeAdapter
  sessionStore: SessionStore
  startedAt: number
  shutdownFn?: () => Promise<void>
  taskQueue?: TaskQueue
}
