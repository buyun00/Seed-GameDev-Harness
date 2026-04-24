import { watch, type FSWatcher } from 'chokidar'
import type { ProjectContext } from './project-context.js'
import type { Scanner } from './scanner.js'
import type { SseEmitter } from '../sse/emitter.js'

export class Watcher {
  private fsWatcher: FSWatcher | null = null

  constructor(
    private ctx: ProjectContext,
    private scanner: Scanner,
    private sseEmitter: SseEmitter,
  ) {}

  start() {
    const patterns = [
      this.ctx.resolve('CLAUDE.md'),
      this.ctx.resolve('CLAUDE.local.md'),
      this.ctx.resolve('.claude', '**', '*.md'),
      ...this.ctx.knowledgeDirs.map(d => `${d}/**/*.md`),
    ]

    this.fsWatcher = watch(patterns, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300 },
    })

    this.fsWatcher.on('change', (path) => {
      this.handleChange(path as string, 'change')
    })
    this.fsWatcher.on('add', (path) => {
      this.handleChange(path as string, 'add')
    })
    this.fsWatcher.on('unlink', (path) => {
      this.handleChange(path as string, 'unlink')
    })
  }

  stop() {
    this.fsWatcher?.close()
  }

  private async handleChange(filePath: string, event: 'change' | 'add' | 'unlink') {
    const relativePath = this.ctx.relative(filePath)
    const kind = this.inferKind(relativePath)
    await this.scanner.scanFile(filePath, event)
    this.sseEmitter.emit('file:changed', { path: relativePath, kind })
    this.sseEmitter.emit('scan:updated', {})
  }

  private inferKind(relativePath: string): string {
    if (relativePath.includes('CLAUDE')) return 'constitution'
    if (relativePath.startsWith('.claude/rules')) return 'knowledge'
    return 'knowledge'
  }
}
