import { readFile, writeFile, rename, copyFile, unlink, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
/**
 * Simple async mutex: guarantees only one holder at a time per key.
 */
class Mutex {
    queues = new Map();
    held = new Set();
    async acquire(key) {
        if (!this.held.has(key)) {
            this.held.add(key);
            return;
        }
        return new Promise((resolve) => {
            if (!this.queues.has(key))
                this.queues.set(key, []);
            this.queues.get(key).push(resolve);
        });
    }
    release(key) {
        const queue = this.queues.get(key);
        if (queue && queue.length > 0) {
            const next = queue.shift();
            if (queue.length === 0)
                this.queues.delete(key);
            next();
        }
        else {
            this.held.delete(key);
            this.queues.delete(key);
        }
    }
}
export class Writer {
    mutex = new Mutex();
    static async cleanupStaleFiles(dir, maxAgeMs = 60 * 60 * 1000) {
        const now = Date.now();
        await this.cleanupDirectory(dir, now, maxAgeMs);
    }
    static async cleanupDirectory(dir, now, maxAgeMs) {
        let entries;
        try {
            entries = await readdir(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        await Promise.all(entries.map(async (entry) => {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                await this.cleanupDirectory(fullPath, now, maxAgeMs);
                return;
            }
            if (!entry.isFile() || !entry.name.endsWith('.tmp'))
                return;
            try {
                const fileStat = await stat(fullPath);
                if (now - fileStat.mtimeMs > maxAgeMs) {
                    await unlink(fullPath);
                }
            }
            catch {
                // ignore cleanup errors
            }
        }));
    }
    async write(filePath, content) {
        await this.mutex.acquire(filePath);
        try {
            await this.doWrite(filePath, content);
        }
        finally {
            this.mutex.release(filePath);
        }
    }
    async read(filePath) {
        return readFile(filePath, 'utf-8');
    }
    async doWrite(filePath, content) {
        const tmpPath = `${filePath}.tmp`;
        const bakPath = `${filePath}.bak`;
        const hadOriginal = existsSync(filePath);
        try {
            if (hadOriginal) {
                await copyFile(filePath, bakPath);
            }
            await writeFile(tmpPath, content, 'utf-8');
            await rename(tmpPath, filePath);
        }
        catch (err) {
            try {
                if (existsSync(tmpPath))
                    await unlink(tmpPath);
            }
            catch { /* ignore */ }
            if (hadOriginal) {
                try {
                    if (existsSync(bakPath))
                        await copyFile(bakPath, filePath);
                }
                catch { /* ignore */ }
            }
            throw err;
        }
    }
}
