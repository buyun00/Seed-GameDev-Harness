import { Hono } from 'hono';
export function settingsRoutes(ctx) {
    const router = new Hono();
    router.get('/settings', (c) => {
        const data = ctx.settingsStore.getAll();
        return c.json({
            language: data.language,
            theme: data.theme,
            activeApiKey: data.activeApiKey,
            chatHistory: data.chatHistory,
        });
    });
    router.put('/settings/language', async (c) => {
        const { language } = await c.req.json();
        ctx.settingsStore.set('language', language);
        return c.json({ ok: true, language });
    });
    router.put('/settings/theme', async (c) => {
        const { theme } = await c.req.json();
        ctx.settingsStore.set('theme', theme);
        return c.json({ ok: true, theme });
    });
    router.put('/settings/chat-history', async (c) => {
        const { history } = await c.req.json();
        ctx.settingsStore.updateChatHistory(history);
        return c.json({ ok: true });
    });
    return router;
}
