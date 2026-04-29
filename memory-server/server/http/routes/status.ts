import { Hono } from 'hono'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { AppContext } from '../../types.js'

function readLanguage(projectRoot: string): string {
  try {
    const configPath = join(projectRoot, '.seed', 'config.json')
    if (!existsSync(configPath)) return ''
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config.language || ''
  } catch {
    return ''
  }
}

export function statusRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/status', (c) => {
    const assets = ctx.scanner.getAll()
    return c.json({
      status: 'running',
      projectPath: ctx.projectContext.projectRoot,
      language: readLanguage(ctx.projectContext.projectRoot),
      assets: {
        total: assets.length,
        constitution: assets.filter(a => a.kind === 'constitution').length,
        memory: assets.filter(a => a.kind === 'memory').length,
        knowledge: assets.filter(a => a.kind === 'knowledge').length,
      },
      sseClients: ctx.sseEmitter.clientCount,
    })
  })

  router.put('/settings/language', async (c) => {
    const { language } = await c.req.json<{ language: string }>()
    const configDir = join(ctx.projectContext.projectRoot, '.seed')
    const configPath = join(configDir, 'config.json')

    let config: Record<string, unknown> = {}
    if (existsSync(configPath)) {
      try {
        config = JSON.parse(readFileSync(configPath, 'utf-8'))
      } catch { /* ignore */ }
    }

    config.language = language

    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')

    return c.json({ ok: true, language })
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
