import { Hono } from 'hono'
import type { AppContext } from '../../types.js'
import { KnowledgeCategorizer } from '../../analyzers/knowledge-categorizer.js'

export function projectKnowledgeRoutes(ctx: AppContext) {
  const router = new Hono()
  const categorizer = new KnowledgeCategorizer(ctx)

  router.get('/', async (c) => {
    const category = c.req.query('category')
    const objects = await categorizer.getAll(category)
    return c.json({ objects })
  })

  router.get('/:id', async (c) => {
    const id = c.req.param('id')
    const obj = await categorizer.getById(id)
    if (!obj) return c.json({ error: 'Not found' }, 404)
    return c.json(obj)
  })

  router.post('/distill', async (c) => {
    const body = await c.req.json<{
      knowledgeId: string
      targetType: 'rule' | 'memory'
    }>()
    try {
      const proposal = await categorizer.proposeDistillation(body.knowledgeId, body.targetType)
      return c.json(proposal)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Distillation failed'
      return c.json({ error: msg }, 500)
    }
  })

  return router
}
