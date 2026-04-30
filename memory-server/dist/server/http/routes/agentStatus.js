import { Hono } from 'hono';
export function agentStatusRoutes(ctx) {
    const router = new Hono();
    router.get('/agents', (c) => {
        const agents = ctx.agentStatusManager.getAllAgents();
        return c.json({ agents });
    });
    router.get('/agents/:id', (c) => {
        const { id } = c.req.param();
        const agent = ctx.agentStatusManager.getAgent(id);
        if (!agent)
            return c.json({ error: `Agent '${id}' not found` }, 404);
        return c.json({ agent });
    });
    return router;
}
