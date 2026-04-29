import { readFile, writeFile, rename, copyFile, unlink, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Simple async mutex: guarantees only one holder at a time per key.
 */
class Mutex {
  private queues = new Map<string, Array<() => void>>()
  private held = new Set<string>()

  async acquire(key: string): Promise<void> {
    if (!this.held.has(key)) {
      this.held.add(key)
      return
    }
    return new Promise<void>((resolve) => {
      if (!this.queues.has(key)) this.queues.set(key, [])
      this.queues.get(key)!.push(resolve)
    })
  }

  release(key: string): void {
    const queue = this.queues.get(key)
    if (queue && queue.length > 0) {
      const next = queue.shift()!
      if (queue.length === 0) this.queues.delete(key)
      next()
    } else {
      this.held.delete(key)
      this.queues.delete(key)
    }
  }
}

export class Writer {
  private mutex = new Mutex()

  static async cleanupStaleFiles(dir: string, maxAgeMs: number = 60 * 60 * 1000): Promise<void> {
    const now = Date.now()
    await this.cleanupDirectory(dir, now, maxAgeMs)
  }

  private static async cleanupDirectory(dir: string, now: number, maxAgeMs: number): Promise<void> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    await Promise.all(entries.map(async (entry) => {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        await this.cleanupDirectory(fullPath, now, maxAgeMs)
        return
      }
      if (!entry.isFile() || !entry.name.endsWith('.tmp')) return

      try {
        const fileStat = await stat(fullPath)
        if (now - fileStat.mtimeMs > maxAgeMs) {
          await unlink(fullPath)
        }
      } catch {
        // ignore cleanup errors
      }
    }))
  }

  async write(filePath: string, content: string): Promise<void> {
    await this.mutex.acquire(filePath)
    try {
      await this.doWrite(filePath, content)
    } finally {
      this.mutex.release(filePath)
    }
  }

  async read(filePath: string): Promise<string> {
    return readFile(filePath, 'utf-8')
  }

  private async doWrite(filePath: string, content: string): Promise<void> {
    const tmpPath = `${filePath}.tmp`
    const bakPath = `${filePath}.bak`
    const hadOriginal = existsSync(filePath)

    try {
      if (hadOriginal) {
        await copyFile(filePath, bakPath)
      }
      await writeFile(tmpPath, content, 'utf-8')
      await rename(tmpPath, filePath)
    } catch (err) {
      try { if (existsSync(tmpPath)) await unlink(tmpPath) } catch { /* ignore */ }
      if (hadOriginal) {
        try { if (existsSync(bakPath)) await copyFile(bakPath, filePath) } catch { /* ignore */ }
      }
      throw err
    }
  }
}
