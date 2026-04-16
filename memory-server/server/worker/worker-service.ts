import { serve, type ServerType } from '@hono/node-server'
import { createApp } from '../http/app.js'
import { SseEmitter } from '../sse/emitter.js'
import { Scanner } from '../core/scanner.js'
import { Watcher } from '../core/watcher.js'
import { Cache } from '../core/cache.js'
import { Writer } from '../core/writer.js'
import { ClaudeAdapter } from '../core/claude-adapter.js'
import { ProjectContext } from '../core/project-context.js'
import { join } from 'node:path'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import {
  canonicalizeProjectPath,
  writePidFile,
  removePidFile,
} from './process-manager.js'
import { TaskQueue } from './queue/task-queue.js'
import { runConstitutionAnalysis, type ConstitutionAnalysisParams } from './agents/constitution-agent.js'
import { runProposalEdit, runProposalCreate, type ProposalEditParams, type ProposalCreateParams } from './agents/proposal-agent.js'
import { runMemoryAnalysis, type MemoryAnalysisParams } from './agents/memory-agent.js'
import { runKnowledgeDistill, type KnowledgeDistillParams } from './agents/knowledge-agent.js'
import { detectAgentBackend } from './agents/base-agent.js'
import type { AppContext, SessionStore } from '../types.js'

export class WorkerService {
  private server: ServerType | null = null
  private watcher: Watcher | null = null
  private canonicalPath: string = ''
  private shuttingDown = false

  async start(rawProjectPath: string, port: number = 0): Promise<{ port: number }> {
    this.canonicalPath = canonicalizeProjectPath(rawProjectPath)
    const agentBackend = await detectAgentBackend()

    const projectContext = new ProjectContext(rawProjectPath)
    await projectContext.initialize()

    const cache = new Cache(projectContext)
    const writer = new Writer()
    const sseEmitter = new SseEmitter()
    const claudeAdapter = new ClaudeAdapter()
    const scanner = new Scanner(projectContext)
    const watcher = new Watcher(projectContext, scanner, sseEmitter)
    this.watcher = watcher

    const sessionStore: SessionStore = new Set<string>()
    const taskQueue = new TaskQueue(sseEmitter)

    const ctx: AppContext = {
      projectContext,
      scanner,
      watcher,
      cache,
      writer,
      sseEmitter,
      claudeAdapter,
      sessionStore,
      startedAt: Date.now(),
      shutdownFn: () => this.shutdown(),
      taskQueue,
    }

    // Register task handlers
    taskQueue.registerHandler<ConstitutionAnalysisParams, unknown>(
      'constitution_analysis',
      (params, signal) => runConstitutionAnalysis(ctx, params, signal),
    )
    taskQueue.registerHandler<ProposalEditParams, unknown>(
      'proposal_generation',
      (params, signal) => runProposalEdit(ctx, params, signal),
    )
    taskQueue.registerHandler<ProposalCreateParams, unknown>(
      'proposal_create',
      (params, signal) => runProposalCreate(ctx, params, signal),
    )
    taskQueue.registerHandler<MemoryAnalysisParams, unknown>(
      'memory_analysis',
      (params, signal) => runMemoryAnalysis(ctx, params, signal),
    )
    taskQueue.registerHandler<KnowledgeDistillParams, unknown>(
      'knowledge_distill',
      (params, signal) => runKnowledgeDistill(ctx, params, signal),
    )

    await scanner.scan()
    watcher.start()

    const app = createApp(ctx)

    return new Promise<{ port: number }>((resolveStart) => {
      this.server = serve(
        {
          fetch: app.fetch,
          hostname: '127.0.0.1',
          port,
        },
        (info) => {
          const actualPort = info.port
          writePidFile(this.canonicalPath, {
            pid: process.pid,
            port: actualPort,
            projectPath: this.canonicalPath,
            startedAt: new Date().toISOString(),
          })

          const url = `http://127.0.0.1:${actualPort}/`
          process.stderr.write(`\n[Seed Worker] Serving ${this.canonicalPath}\n`)
          process.stderr.write(`[Seed Worker] URL: ${url}\n`)
          process.stderr.write(`[Seed Worker] PID: ${process.pid}  Port: ${actualPort}\n`)
          process.stderr.write(`[Seed Worker] Agent backend: ${agentBackend.label}\n`)
          process.stderr.write(`[Seed Worker] Node: ${process.execPath}\n`)
          process.stderr.write(`[Seed Worker] CWD: ${process.cwd()}\n`)
          if (agentBackend.error) {
            process.stderr.write(`[Seed Worker] Agent backend error: ${agentBackend.error}\n`)
          }
          process.stderr.write('\n')

          // Write URL to project .seed/ for easy discovery
          this.writeUrlFile(projectContext.projectRoot, url)

          this.registerSignalHandlers()
          resolveStart({ port: actualPort })
        },
      )
    })
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown) return
    this.shuttingDown = true

    process.stderr.write('[Seed Worker] Shutting down...\n')

    try { this.watcher?.stop() } catch { /* ignore */ }

    if (this.server) {
      try { this.server.close() } catch { /* ignore */ }
    }

    removePidFile(this.canonicalPath)
    process.stderr.write('[Seed Worker] Shutdown complete.\n')
  }

  private writeUrlFile(projectRoot: string, url: string): void {
    try {
      const seedDir = join(projectRoot, '.seed')
      if (!existsSync(seedDir)) {
        mkdirSync(seedDir, { recursive: true })
      }
      writeFileSync(join(seedDir, 'memory-editor.url'), url, 'utf-8')
    } catch { /* non-critical */ }
  }

  private registerSignalHandlers(): void {
    const handler = async () => {
      await this.shutdown()
      process.exit(0)
    }
    process.on('SIGINT', handler)
    process.on('SIGTERM', handler)
  }
}
