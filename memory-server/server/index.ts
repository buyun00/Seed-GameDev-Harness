import { parseArgs } from 'node:util'
import { WorkerService } from './worker/worker-service.js'
import { ensureWorkerStarted } from './worker/spawner.js'
import {
  canonicalizeProjectPath,
  readPidFile,
  removePidFile,
  validatePidFile,
  isProcessAlive,
  listAllWorkers,
} from './worker/process-manager.js'

const { values, positionals } = parseArgs({
  options: {
    'project-path': { type: 'string' },
    port: { type: 'string', default: '0' },
    daemon: { type: 'boolean', default: false },
  },
  allowPositionals: true,
  strict: false,
})

const subcommand = positionals[0] ?? (values.daemon ? 'daemon' : 'daemon')

function requireProjectPath(): string {
  const raw = values['project-path'] as string | undefined
  if (!raw) {
    process.stderr.write('[Seed Worker] Error: --project-path is required\n')
    process.exit(1)
  }
  return raw
}

async function cmdStart() {
  const raw = requireProjectPath()
  const port = parseInt(values.port as string, 10) || 0
  try {
    const result = await ensureWorkerStarted(raw, { port })
    process.stderr.write(`[Seed Worker] Worker ready on port ${result.port} (alreadyRunning=${result.alreadyRunning})\n`)
    process.stdout.write(JSON.stringify({
      status: 'ok',
      port: result.port,
      projectPath: canonicalizeProjectPath(raw),
      alreadyRunning: result.alreadyRunning,
    }))
  } catch (err) {
    process.stderr.write(`[Seed Worker] Failed to start: ${err}\n`)
    process.exit(1)
  }
}

async function cmdStop() {
  const raw = requireProjectPath()
  const canonical = canonicalizeProjectPath(raw)
  const info = readPidFile(canonical)
  if (!info) {
    process.stderr.write('[Seed Worker] No worker running for this project\n')
    return
  }
  try {
    const resp = await fetch(`http://127.0.0.1:${info.port}/api/admin/shutdown`, {
      method: 'POST',
    })
    if (resp.ok) {
      process.stderr.write('[Seed Worker] Shutdown signal sent\n')
    }
  } catch {
    // HTTP failed — try direct kill
    if (isProcessAlive(info.pid)) {
      try { process.kill(info.pid) } catch { /* ignore */ }
    }
  }
  removePidFile(canonical)
  process.stderr.write('[Seed Worker] Stopped\n')
}

async function cmdRestart() {
  await cmdStop()
  await new Promise(r => setTimeout(r, 1000))
  await cmdStart()
}

function cmdStatus() {
  const raw = values['project-path'] as string | undefined
  if (raw) {
    const canonical = canonicalizeProjectPath(raw)
    const state = validatePidFile(canonical)
    const info = readPidFile(canonical)
    if (state === 'alive' && info) {
      process.stdout.write(JSON.stringify({ status: 'alive', ...info }))
    } else {
      process.stdout.write(JSON.stringify({ status: state }))
    }
  } else {
    const workers = listAllWorkers()
    process.stdout.write(JSON.stringify(workers, null, 2))
  }
}

async function cmdDaemon() {
  const raw = requireProjectPath()
  const port = parseInt(values.port as string, 10) || 0

  const service = new WorkerService()
  await service.start(raw, port)
  // Keep process alive — signal handlers registered inside WorkerService
}

async function main() {
  switch (subcommand) {
    case 'start':
      await cmdStart()
      break
    case 'stop':
      await cmdStop()
      break
    case 'restart':
      await cmdRestart()
      break
    case 'status':
      cmdStatus()
      break
    case 'daemon':
      await cmdDaemon()
      break
    default:
      await cmdDaemon()
      break
  }
}

main().catch((err) => {
  process.stderr.write(`[Seed Worker] Fatal error: ${err}\n`)
  process.exit(1)
})
