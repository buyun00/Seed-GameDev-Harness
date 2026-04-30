import { createMiddleware } from 'hono/factory';
const AUTH_EXEMPT = new Set([
    '/api/health',
    '/api/auth/bootstrap',
]);
export function authMiddleware(ctx) {
    return createMiddleware(async (c, next) => {
        const path = c.req.path;
        if (!path.startsWith('/api/') || AUTH_EXEMPT.has(path)) {
            return next();
        }
        const cookie = c.req.header('Cookie');
        if (cookie) {
            const match = cookie.match(/seed_session=([^;]+)/);
            if (match && ctx.sessionStore.validate(match[1])) {
                return next();
            }
        }
        return c.json({ error: 'Unauthorized' }, 401);
    });
}
