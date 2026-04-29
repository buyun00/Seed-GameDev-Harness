import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { randomUUID } from 'node:crypto'
import type { AppContext } from '../types.js'
import { authMiddleware } from './middleware/auth.js'
import { errorMiddleware } from './middleware/error.js'
import { statusRoutes } from './routes/status.js'
import { constitutionRoutes } from './routes/constitution.js'
import { proposalRoutes } from './routes/proposal.js'
import { autoMemoryRoutes } from './routes/autoMemory.js'
import { projectKnowledgeRoutes } from './routes/projectKnowledge.js'
import { taskRoutes } from './routes/tasks.js'

function isLocalhost(remoteAddr: string | undefined): boolean {
  if (!remoteAddr) return false
  return remoteAddr === '127.0.0.1' || remoteAddr === '::1' || remoteAddr === '::ffff:127.0.0.1'
}

export function createApp(ctx: AppContext) {
  const app = new Hono()

  app.use('*', cors({
    origin: (origin) => {
      if (!origin) return origin ?? '*'
      try {
        const url = new URL(origin)
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return origin
        }
      } catch { /* invalid origin */ }
      return null as unknown as string
    },
    credentials: true,
  }))
  app.use('*', errorMiddleware())

  // --- Public routes (no auth) ---

  app.get('/api/health', (c) => {
    return c.json({
      status: 'ok',
      projectPath: ctx.projectContext.projectRoot,
      uptime: Math.floor((Date.now() - ctx.startedAt) / 1000),
    })
  })

  app.get('/api/auth/bootstrap', (c) => {
    const incoming = (c.env as Record<string, any>)?.incoming
    const remoteAddr = incoming?.socket?.remoteAddress

    if (!remoteAddr || !isLocalhost(remoteAddr)) {
      return c.json({ error: 'Bootstrap only available from localhost' }, 403)
    }

    const sessionToken = randomUUID()
    ctx.sessionStore.add(sessionToken)

    c.header('Set-Cookie', `seed_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/`)
    return c.json({ ok: true })
  })

  // --- Auth middleware for /api/* ---
  app.use('*', authMiddleware(ctx))

  // --- Admin routes (auth + localhost) ---

  app.post('/api/admin/shutdown', async (c) => {
    if (ctx.shutdownFn) {
      setTimeout(() => ctx.shutdownFn?.(), 100)
    }
    return c.json({ ok: true })
  })

  // --- Business routes ---

  app.route('/api', statusRoutes(ctx))
  app.route('/api/constitution', constitutionRoutes(ctx))
  app.route('/api/proposals', proposalRoutes(ctx))
  app.route('/api/auto-memory', autoMemoryRoutes(ctx))
  app.route('/api/project-knowledge', projectKnowledgeRoutes(ctx))
  app.route('/api/tasks', taskRoutes(ctx))

  // --- Static file serving (Vue frontend) ---

  app.use('/*', serveStatic({ root: './dist/client' }))
  app.use('/*', serveStatic({ root: './dist/client', path: 'index.html' }))

  return app
}
