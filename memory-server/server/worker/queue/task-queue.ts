import { randomUUID } from 'node:crypto'
import type { SseEmitter } from '../../sse/emitter.js'
import type { Task, TaskType, TaskHandler, TaskStatus } from './task-types.js'

export class TaskQueue {
  private tasks = new Map<string, Task>()
  private handlers = new Map<TaskType, TaskHandler>()
  private queue: string[] = []
  private processing = false
  private abortControllers = new Map<string, AbortController>()

  constructor(private sseEmitter: SseEmitter) {}

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
        if (task.status === 'cancelled') continue
        task.status = 'completed'
        task.result = result
        task.completedAt = new Date().toISOString()
        this.broadcast(task, 'task:complete')
      } catch (err) {
        if (task.status === 'cancelled') continue
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
