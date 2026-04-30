import type { AppContext } from '../../types.js';
export declare function authMiddleware(ctx: AppContext): import("hono").MiddlewareHandler<any, string, {}, Response & import("hono").TypedResponse<{
    error: string;
}, 401, "json">>;
