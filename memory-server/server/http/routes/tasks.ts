import { Hono } from 'hono'
import type { AppContext } from '../../types.js'

export function taskRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/', (c) => {
    if (!ctx.taskQueue) {
      return c.json({ tasks: [] })
    }
    const type = c.req.query('type') as string | undefined
    const status = c.req.query('status') as string | undefined
    const tasks = ctx.taskQueue.listTasks({
      type: type as any,
      status: status as any,
    })
    return c.json({ tasks })
  })

  router.get('/:id', (c) => {
    if (!ctx.taskQueue) {
      return c.json({ error: 'Task queue not available' }, 503)
    }
    const task = ctx.taskQueue.getTask(c.req.param('id'))
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }
    return c.json(task)
  })

  router.delete('/:id', (c) => {
    if (!ctx.taskQueue) {
      return c.json({ error: 'Task queue not available' }, 503)
    }
    const cancelled = ctx.taskQueue.cancelTask(c.req.param('id'))
    if (!cancelled) {
      return c.json({ error: 'Task not found or already finished' }, 404)
    }
    return c.json({ ok: true })
  })

  return router
}
