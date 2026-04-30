import { serve, type ServerType } from '@hono/node-server'
import { createApp } from '../http/app.js'
import { SseEmitter } from '../sse/emitter.js'
import { Scanner } from '../core/scanner.js'
import { Watcher } from '../core/watcher.js'
import { Cache } from '../core/cache.js'
import { Writer } from '../core/writer.js'
import { ProjectContext } from '../core/project-context.js'
import { LlmProvider } from '../core/llm-provider.js'
import { AgentStatusManager } from './agent-status-manager.js'
import { join } from 'node:path'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import {
  canonicalizeProjectPath,
  acquirePidFile,
  updatePidFile,
  removePidFile,
} from './process-manager.js'
import { TaskQueue } from './queue/task-queue.js'
import { runConstitutionAnalysis, type ConstitutionAnalysisParams } from './agents/constitution-agent.js'
import { runProposalEdit, runProposalCreate, type ProposalEditParams, type ProposalCreateParams } from './agents/proposal-agent.js'
import { runMemoryAnalysis, type MemoryAnalysisParams } from './agents/memory-agent.js'
import { runKnowledgeDistill, type KnowledgeDistillParams } from './agents/knowledge-agent.js'
import type { AppContext } from '../types.js'
import { SessionStore } from '../types.js'
import { SettingsStore } from '../core/settings-store.js'

export class WorkerService {
  private server: ServerType | null = null
  private watcher: Watcher | null = null
  private sessionStore: SessionStore | null = null
  private taskQueue: TaskQueue | null = null
  private canonicalPath: string = ''
  private shuttingDown = false

  async start(rawProjectPath: string, port: number = 0): Promise<{ port: number }> {
    this.canonicalPath = canonicalizeProjectPath(rawProjectPath)

    const acquired = acquirePidFile(this.canonicalPath, {
      pid: process.pid,
      port: 0,
      projectPath: this.canonicalPath,
      startedAt: new Date().toISOString(),
    })
    if (!acquired) {
      throw new Error(`Another worker is already running for ${this.canonicalPath}`)
    }

    try {
      const projectContext = new ProjectContext(rawProjectPath)
      await projectContext.initialize()

      const cache = new Cache(projectContext)
      const writer = new Writer()
      const sseEmitter = new SseEmitter()
      const scanner = new Scanner(projectContext)
      const watcher = new Watcher(projectContext, scanner, sseEmitter)
      this.watcher = watcher

      const sessionStore = new SessionStore()
      this.sessionStore = sessionStore
      const taskQueue = new TaskQueue(sseEmitter)
      this.taskQueue = taskQueue
      const settingsStore = new SettingsStore(projectContext.projectRoot)
      const llmProvider = new LlmProvider()
      const agentStatusManager = new AgentStatusManager(sseEmitter)

      const savedConfigs = settingsStore.get('apiConfigs')
      for (const { key, config } of savedConfigs) {
        llmProvider.setConfig(key, config)
      }
      const activeKey = settingsStore.get('activeApiKey')
      if (activeKey) {
        llmProvider.setActiveConfig(activeKey)
      }

      const ctx: AppContext = {
        projectContext,
        scanner,
        watcher,
        cache,
        writer,
        sseEmitter,
        sessionStore,
        startedAt: Date.now(),
        shutdownFn: () => this.shutdown(),
        taskQueue,
        llmProvider,
        agentStatusManager,
        settingsStore,
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

      await Writer.cleanupStaleFiles(projectContext.projectRoot)
      await scanner.scan()
      watcher.start()

      const app = createApp(ctx)

      return await new Promise<{ port: number }>((resolveStart) => {
        this.server = serve(
          {
            fetch: app.fetch,
            hostname: '127.0.0.1',
            port,
          },
          (info) => {
            const actualPort = info.port
            updatePidFile(this.canonicalPath, {
              pid: process.pid,
              port: actualPort,
              projectPath: this.canonicalPath,
              startedAt: new Date().toISOString(),
            })

            const url = `http://127.0.0.1:${actualPort}/`
            process.stderr.write(`\n[Seed Worker] Serving ${this.canonicalPath}\n`)
            process.stderr.write(`[Seed Worker] URL: ${url}\n`)
            process.stderr.write(`[Seed Worker] PID: ${process.pid}  Port: ${actualPort}\n`)
            process.stderr.write(`[Seed Worker] Node: ${process.execPath}\n`)
            process.stderr.write(`[Seed Worker] CWD: ${process.cwd()}\n`)
            process.stderr.write('\n')

            // Write URL to project .seed/ for easy discovery
            this.writeUrlFile(projectContext.projectRoot, url)

            this.registerSignalHandlers()
            resolveStart({ port: actualPort })
          },
        )
      })
    } catch (err) {
      removePidFile(this.canonicalPath)
      throw err
    }
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown) return
    this.shuttingDown = true

    process.stderr.write('[Seed Worker] Shutting down...\n')

    try { this.watcher?.stop() } catch { /* ignore */ }
    try { this.sessionStore?.dispose() } catch { /* ignore */ }
    try { this.taskQueue?.dispose() } catch { /* ignore */ }

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
