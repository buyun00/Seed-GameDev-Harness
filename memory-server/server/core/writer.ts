import { readFile, writeFile, rename, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export class Writer {
  private locks = new Map<string, Promise<void>>()

  async write(filePath: string, content: string): Promise<void> {
    const existing = this.locks.get(filePath) ?? Promise.resolve()
    const op = existing.then(() => this.doWrite(filePath, content))
    this.locks.set(filePath, op.then(() => {}, () => {}))
    await op
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
