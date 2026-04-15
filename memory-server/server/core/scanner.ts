import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { ProjectContext } from './project-context.js'
import { stableId, hashString } from '../utils/hash.js'
import { extractTitle, parseMarkdown } from '../utils/markdown.js'
import type { Asset, AssetKind } from '../models/asset.js'

export class Scanner {
  private assets = new Map<string, Asset>()

  constructor(private ctx: ProjectContext) {}

  async scan(): Promise<void> {
    this.assets.clear()
    await this.scanConstitution()
    await this.scanRules()
    await this.scanKnowledgeDirs()
  }

  getAll(): Asset[] {
    return [...this.assets.values()]
  }

  getByKind(kind: AssetKind): Asset[] {
    return this.getAll().filter(a => a.kind === kind)
  }

  getById(id: string): Asset | undefined {
    return this.assets.get(id)
  }

  updateAsset(asset: Asset) {
    this.assets.set(asset.id, asset)
  }

  private async scanConstitution() {
    for (const filePath of this.ctx.constitutionFiles) {
      await this.addAsset(filePath, 'constitution')
    }
  }

  private async scanRules() {
    const rulesDir = this.ctx.rulesDir
    if (!existsSync(rulesDir)) return
    const files = await this.walkMd(rulesDir)
    for (const f of files) {
      await this.addAsset(f, 'knowledge', ['rules'])
    }
  }

  private async scanKnowledgeDirs() {
    for (const dir of this.ctx.knowledgeDirs) {
      const files = await this.walkMd(dir)
      for (const f of files) {
        await this.addAsset(f, 'knowledge')
      }
    }
  }

  private async addAsset(filePath: string, kind: AssetKind, tags: string[] = []) {
    try {
      const raw = await readFile(filePath, 'utf-8')
      const relativePath = this.ctx.relative(filePath)
      const id = stableId(relativePath)
      const title = extractTitle(raw, relativePath)
      const { excerpt } = parseMarkdown(raw)
      const fileStat = await stat(filePath)

      const asset: Asset = {
        id,
        title,
        kind,
        sourcePath: relativePath,
        summary: excerpt,
        status: 'active',
        updatedAt: fileStat.mtime.toISOString(),
        tags,
        fileHash: hashString(raw),
      }
      this.assets.set(id, asset)
    } catch {
      // skip unreadable files
    }
  }

  private async walkMd(dir: string): Promise<string[]> {
    const results: string[] = []
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          results.push(...await this.walkMd(full))
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          results.push(full)
        }
      }
    } catch {
      // skip inaccessible dirs
    }
    return results
  }
}
