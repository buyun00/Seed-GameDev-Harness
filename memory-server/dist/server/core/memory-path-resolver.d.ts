import type { ProjectContext } from './project-context.js';
export interface MemoryPathResult {
    path: string | null;
    method: 'settings_override' | 'git_common_dir' | 'git_toplevel' | 'path_slug' | 'not_found';
    hasMemoryMd: boolean;
    diagnostics: string;
}
export declare class MemoryPathResolver {
    private ctx;
    constructor(ctx: ProjectContext);
    resolve(): MemoryPathResult;
    private checkSettingsOverride;
    private resolveProjectSlug;
    private slugify;
}
