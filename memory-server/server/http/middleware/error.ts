import { createMiddleware } from 'hono/factory'

export function errorMiddleware() {
  return createMiddleware(async (c, next) => {
    try {
      await next()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      process.stderr.write(`[Memory Server] Error: ${message}\n`)
      return c.json({ error: message }, 500)
    }
  })
}
