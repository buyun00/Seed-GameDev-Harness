import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { stableId, hashString } from '../utils/hash.js';
import { extractTitle, parseMarkdown } from '../utils/markdown.js';
export class Scanner {
    ctx;
    assets = new Map();
    /** Maps absolute file path → asset id for incremental lookups */
    pathIndex = new Map();
    constructor(ctx) {
        this.ctx = ctx;
    }
    async scan() {
        this.assets.clear();
        this.pathIndex.clear();
        await this.scanConstitution();
        await this.scanRules();
        await this.scanKnowledgeDirs();
    }
    /**
     * Incrementally update a single file instead of re-scanning everything.
     * - change/add: re-read the file and update (or insert) its asset
     * - unlink: remove the asset from the map
     */
    async scanFile(absolutePath, event) {
        const relativePath = this.ctx.relative(absolutePath);
        const id = stableId(relativePath);
        if (event === 'unlink') {
            this.assets.delete(id);
            this.pathIndex.delete(absolutePath);
            return;
        }
        // Determine kind and tags from path
        const { kind, tags } = this.inferKindAndTags(relativePath);
        await this.addAsset(absolutePath, kind, tags);
    }
    inferKindAndTags(relativePath) {
        if (relativePath.includes('CLAUDE'))
            return { kind: 'constitution', tags: [] };
        if (relativePath.startsWith('.claude/rules'))
            return { kind: 'knowledge', tags: ['rules'] };
        return { kind: 'knowledge', tags: [] };
    }
    getAll() {
        return [...this.assets.values()];
    }
    getByKind(kind) {
        return this.getAll().filter(a => a.kind === kind);
    }
    getById(id) {
        return this.assets.get(id);
    }
    updateAsset(asset) {
        this.assets.set(asset.id, asset);
    }
    async scanConstitution() {
        for (const filePath of this.ctx.constitutionFiles) {
            await this.addAsset(filePath, 'constitution');
        }
    }
    async scanRules() {
        const rulesDir = this.ctx.rulesDir;
        if (!existsSync(rulesDir))
            return;
        const files = await this.walkMd(rulesDir);
        for (const f of files) {
            await this.addAsset(f, 'knowledge', ['rules']);
        }
    }
    async scanKnowledgeDirs() {
        for (const dir of this.ctx.knowledgeDirs) {
            const files = await this.walkMd(dir);
            for (const f of files) {
                await this.addAsset(f, 'knowledge');
            }
        }
    }
    async addAsset(filePath, kind, tags = []) {
        try {
            const raw = await readFile(filePath, 'utf-8');
            const relativePath = this.ctx.relative(filePath);
            const id = stableId(relativePath);
            const newHash = hashString(raw);
            // Skip if content hasn't changed
            const existing = this.assets.get(id);
            if (existing && existing.fileHash === newHash)
                return;
            const title = extractTitle(raw, relativePath);
            const { excerpt } = parseMarkdown(raw);
            const fileStat = await stat(filePath);
            const asset = {
                id,
                title,
                kind,
                sourcePath: relativePath,
                summary: excerpt,
                status: 'active',
                updatedAt: fileStat.mtime.toISOString(),
                tags,
                fileHash: newHash,
            };
            this.assets.set(id, asset);
            this.pathIndex.set(filePath, id);
        }
        catch {
            // skip unreadable files
        }
    }
    async walkMd(dir) {
        const results = [];
        try {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const full = join(dir, entry.name);
                if (entry.isDirectory()) {
                    results.push(...await this.walkMd(full));
                }
                else if (entry.isFile() && entry.name.endsWith('.md')) {
                    results.push(full);
                }
            }
        }
        catch {
            // skip inaccessible dirs
        }
        return results;
    }
}
