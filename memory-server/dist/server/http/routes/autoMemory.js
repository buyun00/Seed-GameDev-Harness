import { Hono } from 'hono';
import { MemoryPathResolver } from '../../core/memory-path-resolver.js';
import { MemoryAnalyzer } from '../../analyzers/memory-analyzer.js';
export function autoMemoryRoutes(ctx) {
    const router = new Hono();
    const pathResolver = new MemoryPathResolver(ctx.projectContext);
    const memoryAnalyzer = new MemoryAnalyzer(ctx, pathResolver);
    router.get('/', async (c) => {
        const result = await memoryAnalyzer.scan();
        return c.json(result);
    });
    router.get('/:id', async (c) => {
        const id = c.req.param('id');
        const result = await memoryAnalyzer.scan();
        const obj = result.objects.find(o => o.id === id);
        if (!obj)
            return c.json({ error: 'Memory object not found' }, 404);
        return c.json(obj);
    });
    router.post('/propose-edit', async (c) => {
        const body = await c.req.json();
        try {
            const proposal = await memoryAnalyzer.proposeEdit(body.memoryId, body.changes);
            return c.json(proposal);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed';
            return c.json({ error: msg }, 500);
        }
    });
    router.post('/reindex', async (c) => {
        try {
            const result = await memoryAnalyzer.reindex();
            return c.json(result);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Reindex failed';
            return c.json({ error: msg }, 500);
        }
    });
    return router;
}
