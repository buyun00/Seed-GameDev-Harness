import type { ProjectContext } from './project-context.js';
export declare class Cache {
    private ctx;
    constructor(ctx: ProjectContext);
    private path;
    get<T>(key: string): Promise<T | null>;
    set(key: string, data: unknown): Promise<void>;
    delete(key: string): Promise<void>;
}
