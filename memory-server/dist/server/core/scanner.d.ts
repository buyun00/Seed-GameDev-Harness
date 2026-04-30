import type { ProjectContext } from './project-context.js';
import type { Asset, AssetKind } from '../models/asset.js';
export declare class Scanner {
    private ctx;
    private assets;
    /** Maps absolute file path → asset id for incremental lookups */
    private pathIndex;
    constructor(ctx: ProjectContext);
    scan(): Promise<void>;
    /**
     * Incrementally update a single file instead of re-scanning everything.
     * - change/add: re-read the file and update (or insert) its asset
     * - unlink: remove the asset from the map
     */
    scanFile(absolutePath: string, event: 'change' | 'add' | 'unlink'): Promise<void>;
    private inferKindAndTags;
    getAll(): Asset[];
    getByKind(kind: AssetKind): Asset[];
    getById(id: string): Asset | undefined;
    updateAsset(asset: Asset): void;
    private scanConstitution;
    private scanRules;
    private scanKnowledgeDirs;
    private addAsset;
    private walkMd;
}
