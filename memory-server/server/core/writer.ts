import { readFile, writeFile, rename, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

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
    if (existsSync(filePath)) {
      await copyFile(filePath, `${filePath}.bak`)
    }
    const tmpPath = `${filePath}.tmp`
    await writeFile(tmpPath, content, 'utf-8')
    await rename(tmpPath, filePath)
  }
}
