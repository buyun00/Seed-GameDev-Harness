import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { ProjectContext } from './project-context.js'

export class Cache {
  constructor(private ctx: ProjectContext) {}

  private path(key: string): string {
    return join(this.ctx.cacheDir, `${key}.json`)
  }

  async get<T>(key: string): Promise<T | null> {
    const filePath = this.path(key)
    if (!existsSync(filePath)) return null
    try {
      const raw = await readFile(filePath, 'utf-8')
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set(key: string, data: unknown): Promise<void> {
    const filePath = this.path(key)
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  async delete(key: string): Promise<void> {
    const filePath = this.path(key)
    if (existsSync(filePath)) {
      const { unlink } = await import('node:fs/promises')
      await unlink(filePath)
    }
  }
}
