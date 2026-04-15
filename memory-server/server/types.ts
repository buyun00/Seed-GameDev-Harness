import type { Scanner } from './core/scanner.js'
import type { Watcher } from './core/watcher.js'
import type { Cache } from './core/cache.js'
import type { Writer } from './core/writer.js'
import type { ClaudeAdapter } from './core/claude-adapter.js'
import type { ProjectContext } from './core/project-context.js'
import type { SseEmitter } from './sse/emitter.js'
import type { TaskQueue } from './worker/queue/task-queue.js'

export interface SessionStore {
  add(session: string): void
  has(session: string): boolean
  delete(session: string): boolean
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
