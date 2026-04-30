import { Hono } from 'hono'
import type { AppContext } from '../../types.js'

export function settingsRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/', (c) => {
    const data = ctx.settingsStore.getAll()
    return c.json({
      language: data.language,
      theme: data.theme,
      activeApiKey: data.activeApiKey,
      chatHistory: data.chatHistory,
    })
  })

  router.put('/language', async (c) => {
    const { language } = await c.req.json<{ language: string }>()
    ctx.settingsStore.set('language', language)
    return c.json({ ok: true, language })
  })

  router.put('/theme', async (c) => {
    const { theme } = await c.req.json<{ theme: string }>()
    ctx.settingsStore.set('theme', theme)
    return c.json({ ok: true, theme })
  })

  router.put('/chat-history', async (c) => {
    const { history } = await c.req.json<{ history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> }>()
    ctx.settingsStore.updateChatHistory(history)
    return c.json({ ok: true })
  })

  return router
}
