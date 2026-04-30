import { Hono } from 'hono';
function persistApiConfigs(ctx) {
    const configs = ctx.llmProvider.getAllConfigs().map(c => ({
        key: c.key,
        config: c.config,
    }));
    ctx.settingsStore.set('apiConfigs', configs);
    ctx.settingsStore.set('activeApiKey', ctx.llmProvider.getActiveKey());
}
export function llmRoutes(ctx) {
    const router = new Hono();
    router.get('/config', (c) => {
        const configs = ctx.llmProvider.getAllConfigs();
        const activeKey = ctx.llmProvider.getActiveKey();
        return c.json({ configs, activeKey });
    });
    router.post('/config', async (c) => {
        const { key, provider, apiKey, model, baseUrl, maxTokens, temperature } = await c.req.json();
        if (!key || !provider || !apiKey) {
            return c.json({ error: 'key, provider, and apiKey are required' }, 400);
        }
        ctx.llmProvider.setConfig(key, {
            provider: provider,
            apiKey,
            model: model ?? '',
            baseUrl,
            maxTokens,
            temperature,
        });
        persistApiConfigs(ctx);
        return c.json({ ok: true });
    });
    router.put('/config/:key/activate', (c) => {
        const { key } = c.req.param();
        const ok = ctx.llmProvider.setActiveConfig(key);
        if (!ok)
            return c.json({ error: `Config '${key}' not found` }, 404);
        persistApiConfigs(ctx);
        return c.json({ ok: true, activeKey: key });
    });
    router.delete('/config/:key', (c) => {
        const { key } = c.req.param();
        ctx.llmProvider.removeConfig(key);
        persistApiConfigs(ctx);
        return c.json({ ok: true });
    });
    router.post('/chat', async (c) => {
        const { message, history } = await c.req.json();
        if (!message) {
            return c.json({ error: 'message is required' }, 400);
        }
        const config = ctx.llmProvider.getActiveConfig();
        if (!config) {
            return c.json({ error: 'No active LLM configuration. Please set an API key first.' }, 400);
        }
        const messages = [
            { role: 'system', content: '你是一个 AI 助手，帮助用户完成游戏开发相关的任务。请用中文回答。' },
            ...(history ?? []).map(m => ({
                role: (m.role === 'assistant' ? 'assistant' : 'user'),
                content: m.content,
            })),
            { role: 'user', content: message },
        ];
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullText = '';
                try {
                    ctx.agentStatusManager.startWork('chat', `回答: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`);
                    await ctx.llmProvider.chat({
                        messages,
                        signal: c.req.raw.signal,
                        onChunk: (text) => {
                            fullText += text;
                            const data = JSON.stringify({ text });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        },
                    });
                    ctx.agentStatusManager.completeWork('chat', '回答完成');
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
                catch (err) {
                    ctx.agentStatusManager.failWork('chat', String(err));
                    const error = err instanceof Error ? err.message : String(err);
                    const data = JSON.stringify({ error });
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
                finally {
                    controller.close();
                }
            },
        });
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    });
    return router;
}
