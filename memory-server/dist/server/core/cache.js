import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
export class Cache {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    path(key) {
        return join(this.ctx.cacheDir, `${key}.json`);
    }
    async get(key) {
        const filePath = this.path(key);
        if (!existsSync(filePath))
            return null;
        try {
            const raw = await readFile(filePath, 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async set(key, data) {
        const filePath = this.path(key);
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    async delete(key) {
        const filePath = this.path(key);
        if (existsSync(filePath)) {
            const { unlink } = await import('node:fs/promises');
            await unlink(filePath);
        }
    }
}
