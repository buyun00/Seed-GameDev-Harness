import { randomUUID } from 'node:crypto'
import type { SseEmitter } from '../../sse/emitter.js'
import type { Task, TaskType, TaskHandler, TaskStatus } from './task-types.js'

export class TaskQueue {
  private tasks = new Map<string, Task>()
  private handlers = new Map<TaskType, TaskHandler>()
  private queue: string[] = []
  private processing = false
  private abortControllers = new Map<string, AbortController>()
  /** Max number of finished tasks to retain */
  private readonly maxRetained: number
  /** How long (ms) to keep finished tasks before they become eligible for eviction */
  private readonly retentionMs: number
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(
    private sseEmitter: SseEmitter,
    opts?: { maxRetained?: number; retentionMs?: number },
  ) {
    this.maxRetained = opts?.maxRetained ?? 200
    this.retentionMs = opts?.retentionMs ?? 30 * 60 * 1000 // 30 minutes
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000)
    // Allow the timer to not block process exit
    if (this.cleanupTimer.unref) this.cleanupTimer.unref()
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Remove finished tasks that exceed retention time or count limit.
   */
  private cleanup(): void {
    const now = Date.now()
    const finished: Array<{ id: string; completedAt: number }> = []

    for (const task of this.tasks.values()) {
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        const completedAt = task.completedAt ? new Date(task.completedAt).getTime() : 0
        finished.push({ id: task.id, completedAt })
      }
    }

    // Remove tasks older than retentionMs
    for (const { id, completedAt } of finished) {
      if (now - completedAt > this.retentionMs) {
        this.tasks.delete(id)
      }
    }

    // If still over limit, remove oldest first
    const remaining = finished
      .filter(f => this.tasks.has(f.id))
      .sort((a, b) => a.completedAt - b.completedAt)

    while (remaining.length > this.maxRetained) {
      const oldest = remaining.shift()!
      this.tasks.delete(oldest.id)
    }
  }

  registerHandler<TParams, TResult>(type: TaskType, handler: TaskHandler<TParams, TResult>): void {
    this.handlers.set(type, handler as TaskHandler)
  }

  enqueue<TParams>(type: TaskType, params: TParams): string {
    const id = randomUUID()
    const task: Task<TParams> = {
      id,
      type,
      status: 'pending',
      params,
      createdAt: new Date().toISOString(),
    }
    this.tasks.set(id, task as Task)
    this.queue.push(id)
    this.broadcast(task as Task, 'task:enqueued')
    this.processNext()
    return id
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  listTasks(filter?: { type?: TaskType; status?: TaskStatus }): Task[] {
    let results = Array.from(this.tasks.values())
    if (filter?.type) results = results.filter(t => t.type === filter.type)
    if (filter?.status) results = results.filter(t => t.status === filter.status)
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  cancelTask(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false
    if (task.status === 'completed' || task.status === 'failed') return false

    const ac = this.abortControllers.get(id)
    if (ac) ac.abort()

    task.status = 'cancelled'
    task.completedAt = new Date().toISOString()
    this.broadcast(task, 'task:cancelled')
    return true
  }

  /**
   * Submit a task and wait for it to complete (up to timeoutMs).
   * Returns the completed task, or the still-running task if timeout is reached.
   */
  async waitForTask<TResult>(taskId: string, timeoutMs: number = 180_000): Promise<Task<unknown, TResult>> {
    const start = Date.now()
    const poll = 200

    while (Date.now() - start < timeoutMs) {
      const task = this.tasks.get(taskId) as Task<unknown, TResult> | undefined
      if (!task) throw new Error(`Task ${taskId} not found`)
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        return task
      }
      await new Promise(r => setTimeout(r, poll))
    }

    return this.tasks.get(taskId) as Task<unknown, TResult>
  }

  private async processNext(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const taskId = this.queue.shift()!
      const task = this.tasks.get(taskId)
      if (!task || task.status === 'cancelled') continue

      const handler = this.handlers.get(task.type)
      if (!handler) {
        task.status = 'failed'
        task.error = `No handler registered for task type: ${task.type}`
        task.completedAt = new Date().toISOString()
        this.broadcast(task, 'task:failed')
        continue
      }

      const ac = new AbortController()
      this.abortControllers.set(taskId, ac)

      task.status = 'running'
      task.startedAt = new Date().toISOString()
      this.broadcast(task, 'task:progress')

      try {
        const result = await handler(task.params, ac.signal)
        if ((task.status as TaskStatus) === 'cancelled') continue
        task.status = 'completed'
        task.result = result
        task.completedAt = new Date().toISOString()
        this.broadcast(task, 'task:complete')
      } catch (err) {
        if ((task.status as TaskStatus) === 'cancelled') continue
        task.status = 'failed'
        task.error = err instanceof Error ? err.message : String(err)
        task.completedAt = new Date().toISOString()
        this.broadcast(task, 'task:failed')
      } finally {
        this.abortControllers.delete(taskId)
      }
    }

    this.processing = false
  }

  private broadcast(task: Task, event: string): void {
    this.sseEmitter.emit(event as any, {
      taskId: task.id,
      type: task.type,
      status: task.status,
      progress: task.progress,
      error: task.error,
    })
  }
}
