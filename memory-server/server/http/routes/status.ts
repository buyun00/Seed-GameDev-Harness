import { Hono } from 'hono'
import type { AppContext } from '../../types.js'

export function statusRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/status', (c) => {
    const assets = ctx.scanner.getAll()
    return c.json({
      status: 'running',
      projectPath: ctx.projectContext.projectRoot,
      assets: {
        total: assets.length,
        constitution: assets.filter(a => a.kind === 'constitution').length,
        memory: assets.filter(a => a.kind === 'memory').length,
        knowledge: assets.filter(a => a.kind === 'knowledge').length,
      },
      sseClients: ctx.sseEmitter.clientCount,
    })
  })

  router.get('/events', (c) => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const send = (data: string) => {
          try { controller.enqueue(encoder.encode(data)) } catch { /* closed */ }
        }

        send(': connected\n\n')

        const unsubscribe = ctx.sseEmitter.subscribe((event) => {
          send(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`)
        })

        const interval = setInterval(() => {
          send(': ping\n\n')
        }, 30_000)

        c.req.raw.signal.addEventListener('abort', () => {
          unsubscribe()
          clearInterval(interval)
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  })

  return router
}
