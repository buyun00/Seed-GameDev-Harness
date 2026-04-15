import { resolve, join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export class ProjectContext {
  readonly projectRoot: string
  readonly seedDir: string
  readonly cacheDir: string
  readonly proposalsDir: string

  constructor(projectPath: string) {
    this.projectRoot = resolve(projectPath)
    this.seedDir = join(this.projectRoot, '.seed-memory')
    this.cacheDir = join(this.seedDir, 'cache')
    this.proposalsDir = join(this.seedDir, 'proposals')
  }

  async initialize() {
    await mkdir(this.cacheDir, { recursive: true })
    await mkdir(this.proposalsDir, { recursive: true })
  }

  resolve(...segments: string[]): string {
    return join(this.projectRoot, ...segments)
  }

  relative(absolutePath: string): string {
    const rel = absolutePath.replace(this.projectRoot, '').replace(/^[/\\]/, '')
    return rel.replace(/\\/g, '/')
  }

  get constitutionFiles(): string[] {
    const candidates = [
      'CLAUDE.md',
      '.claude/CLAUDE.md',
      'CLAUDE.local.md',
    ]
    return candidates
      .map(f => this.resolve(f))
      .filter(f => existsSync(f))
  }

  get rulesDir(): string {
    return this.resolve('.claude', 'rules')
  }

  get knowledgeDirs(): string[] {
    const dirs = ['docs', 'research', 'architecture', 'runbooks', 'ops']
    return dirs.map(d => this.resolve(d)).filter(d => existsSync(d))
  }
}
