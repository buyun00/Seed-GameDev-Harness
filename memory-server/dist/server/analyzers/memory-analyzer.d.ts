import type { AppContext } from '../types.js';
import type { MemoryPathResolver } from '../core/memory-path-resolver.js';
import type { MemoryObject } from '../models/memory-object.js';
import type { Proposal } from '../models/proposal.js';
interface MemoryScanResult {
    resolvedPath: string | null;
    resolutionMethod: string;
    hasMemoryMd: boolean;
    diagnostics: string;
    objects: MemoryObject[];
    summary: {
        total: number;
        indexed: number;
        unindexed: number;
        stale: number;
        duplicate: number;
    };
}
export declare class MemoryAnalyzer {
    private ctx;
    private pathResolver;
    constructor(ctx: AppContext, pathResolver: MemoryPathResolver);
    scan(): Promise<MemoryScanResult>;
    proposeEdit(memoryId: string, changes: Record<string, unknown>): Promise<Proposal>;
    reindex(): Promise<{
        indexed: number;
        unindexed: number;
        actions: string[];
    }>;
}
export {};
