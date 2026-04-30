export declare function errorMiddleware(): import("hono").MiddlewareHandler<any, string, {}, Response | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
