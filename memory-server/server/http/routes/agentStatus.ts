import { Hono } from 'hono'
import type { AppContext } from '../../types.js'

export function agentStatusRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/', (c) => {
    const agents = ctx.agentStatusManager.getAllAgents()
    return c.json({ agents })
  })

  router.get('/:id', (c) => {
    const { id } = c.req.param()
    const agent = ctx.agentStatusManager.getAgent(id as any)
    if (!agent) return c.json({ error: `Agent '${id}' not found` }, 404)
    return c.json({ agent })
  })

  return router
}
