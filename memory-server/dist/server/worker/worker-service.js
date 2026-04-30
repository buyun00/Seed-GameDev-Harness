import { serve } from '@hono/node-server';
import { createApp } from '../http/app.js';
import { SseEmitter } from '../sse/emitter.js';
import { Scanner } from '../core/scanner.js';
import { Watcher } from '../core/watcher.js';
import { Cache } from '../core/cache.js';
import { Writer } from '../core/writer.js';
import { ProjectContext } from '../core/project-context.js';
import { LlmProvider } from '../core/llm-provider.js';
import { AgentStatusManager } from './agent-status-manager.js';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { canonicalizeProjectPath, acquirePidFile, updatePidFile, removePidFile, } from './process-manager.js';
import { TaskQueue } from './queue/task-queue.js';
import { runConstitutionAnalysis } from './agents/constitution-agent.js';
import { runProposalEdit, runProposalCreate } from './agents/proposal-agent.js';
import { runMemoryAnalysis } from './agents/memory-agent.js';
import { runKnowledgeDistill } from './agents/knowledge-agent.js';
import { SessionStore } from '../types.js';
import { SettingsStore } from '../core/settings-store.js';
export class WorkerService {
    server = null;
    watcher = null;
    sessionStore = null;
    taskQueue = null;
    canonicalPath = '';
    shuttingDown = false;
    async start(rawProjectPath, port = 0) {
        this.canonicalPath = canonicalizeProjectPath(rawProjectPath);
        const acquired = acquirePidFile(this.canonicalPath, {
            pid: process.pid,
            port: 0,
            projectPath: this.canonicalPath,
            startedAt: new Date().toISOString(),
        });
        if (!acquired) {
            throw new Error(`Another worker is already running for ${this.canonicalPath}`);
        }
        try {
            const projectContext = new ProjectContext(rawProjectPath);
            await projectContext.initialize();
            const cache = new Cache(projectContext);
            const writer = new Writer();
            const sseEmitter = new SseEmitter();
            const scanner = new Scanner(projectContext);
            const watcher = new Watcher(projectContext, scanner, sseEmitter);
            this.watcher = watcher;
            const sessionStore = new SessionStore();
            this.sessionStore = sessionStore;
            const taskQueue = new TaskQueue(sseEmitter);
            this.taskQueue = taskQueue;
            const settingsStore = new SettingsStore(projectContext.projectRoot);
            const llmProvider = new LlmProvider();
            const agentStatusManager = new AgentStatusManager(sseEmitter);
            const savedConfigs = settingsStore.get('apiConfigs');
            for (const { key, config } of savedConfigs) {
                llmProvider.setConfig(key, config);
            }
            const activeKey = settingsStore.get('activeApiKey');
            if (activeKey) {
                llmProvider.setActiveConfig(activeKey);
            }
            const ctx = {
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
            };
            // Register task handlers
            taskQueue.registerHandler('constitution_analysis', (params, signal) => runConstitutionAnalysis(ctx, params, signal));
            taskQueue.registerHandler('proposal_generation', (params, signal) => runProposalEdit(ctx, params, signal));
            taskQueue.registerHandler('proposal_create', (params, signal) => runProposalCreate(ctx, params, signal));
            taskQueue.registerHandler('memory_analysis', (params, signal) => runMemoryAnalysis(ctx, params, signal));
            taskQueue.registerHandler('knowledge_distill', (params, signal) => runKnowledgeDistill(ctx, params, signal));
            await Writer.cleanupStaleFiles(projectContext.projectRoot);
            await scanner.scan();
            watcher.start();
            const app = createApp(ctx);
            return await new Promise((resolveStart) => {
                this.server = serve({
                    fetch: app.fetch,
                    hostname: '127.0.0.1',
                    port,
                }, (info) => {
                    const actualPort = info.port;
                    updatePidFile(this.canonicalPath, {
                        pid: process.pid,
                        port: actualPort,
                        projectPath: this.canonicalPath,
                        startedAt: new Date().toISOString(),
                    });
                    const url = `http://127.0.0.1:${actualPort}/`;
                    process.stderr.write(`\n[Seed Worker] Serving ${this.canonicalPath}\n`);
                    process.stderr.write(`[Seed Worker] URL: ${url}\n`);
                    process.stderr.write(`[Seed Worker] PID: ${process.pid}  Port: ${actualPort}\n`);
                    process.stderr.write(`[Seed Worker] Node: ${process.execPath}\n`);
                    process.stderr.write(`[Seed Worker] CWD: ${process.cwd()}\n`);
                    process.stderr.write('\n');
                    // Write URL to project .seed/ for easy discovery
                    this.writeUrlFile(projectContext.projectRoot, url);
                    this.registerSignalHandlers();
                    resolveStart({ port: actualPort });
                });
            });
        }
        catch (err) {
            removePidFile(this.canonicalPath);
            throw err;
        }
    }
    async shutdown() {
        if (this.shuttingDown)
            return;
        this.shuttingDown = true;
        process.stderr.write('[Seed Worker] Shutting down...\n');
        try {
            this.watcher?.stop();
        }
        catch { /* ignore */ }
        try {
            this.sessionStore?.dispose();
        }
        catch { /* ignore */ }
        try {
            this.taskQueue?.dispose();
        }
        catch { /* ignore */ }
        if (this.server) {
            try {
                this.server.close();
            }
            catch { /* ignore */ }
        }
        removePidFile(this.canonicalPath);
        process.stderr.write('[Seed Worker] Shutdown complete.\n');
    }
    writeUrlFile(projectRoot, url) {
        try {
            const seedDir = join(projectRoot, '.seed');
            if (!existsSync(seedDir)) {
                mkdirSync(seedDir, { recursive: true });
            }
            writeFileSync(join(seedDir, 'memory-editor.url'), url, 'utf-8');
        }
        catch { /* non-critical */ }
    }
    registerSignalHandlers() {
        const handler = async () => {
            await this.shutdown();
            process.exit(0);
        };
        process.on('SIGINT', handler);
        process.on('SIGTERM', handler);
    }
}
