import { spawn } from 'node:child_process'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import {
  canonicalizeProjectPath,
  validatePidFile,
  readPidFile,
} from './process-manager.js'

export interface SpawnResult {
  port: number
  pid: number
  alreadyRunning: boolean
}

/**
 * Ensure a worker is running for the given project path.
 * If already alive, returns the existing port. Otherwise spawns a new
 * hidden background daemon process and polls health until ready.
 */
export async function ensureWorkerStarted(
  rawProjectPath: string,
  opts?: { port?: number; timeoutMs?: number },
): Promise<SpawnResult> {
  const canonical = canonicalizeProjectPath(rawProjectPath)
  const state = validatePidFile(canonical)

  if (state === 'alive') {
    const info = readPidFile(canonical)!
    const healthy = await checkHealth(info.port)
    if (healthy) {
      return { port: info.port, pid: info.pid, alreadyRunning: true }
    }
  }

  const port = opts?.port ?? 0
  const timeoutMs = opts?.timeoutMs ?? 15_000

  const thisDir = __dirname
  const daemonArgs = ['daemon', '--project-path', rawProjectPath, '--port', String(port)]

  let workerCmd: string
  let workerArgs: string[]

  // Priority 1: running from the esbuild bundle (dist/worker.cjs)
  const bundlePath = join(thisDir, 'worker.cjs')
  if (existsSync(bundlePath)) {
    workerCmd = process.execPath
    workerArgs = [bundlePath, ...daemonArgs]
  } else {
    // Priority 2: compiled JS entry (tsc output)
    const entryScriptJs = resolve(thisDir, '..', 'index.js')
    if (existsSync(entryScriptJs)) {
      workerCmd = process.execPath
      workerArgs = [entryScriptJs, ...daemonArgs]
    } else {
      // Priority 3: dev mode — run TypeScript source via tsx
      const entryScript = resolve(thisDir, '..', 'index.ts')
      const tsxBin = resolve(thisDir, '..', '..', 'node_modules', '.bin', 'tsx')
      if (existsSync(tsxBin) || existsSync(tsxBin + '.cmd')) {
        workerCmd = process.platform === 'win32' ? tsxBin + '.cmd' : tsxBin
        workerArgs = [entryScript, ...daemonArgs]
      } else {
        workerCmd = 'npx'
        workerArgs = ['tsx', entryScript, ...daemonArgs]
      }
    }
  }

  spawnInConsole(workerCmd, workerArgs, rawProjectPath)

  // Poll for health
  const start = Date.now()
  const pollInterval = 500
  while (Date.now() - start < timeoutMs) {
    await sleep(pollInterval)

    const info = readPidFile(canonical)
    if (info) {
      const healthy = await checkHealth(info.port)
      if (healthy) {
        return { port: info.port, pid: info.pid, alreadyRunning: false }
      }
    }
  }

  throw new Error(`Worker failed to start within ${timeoutMs}ms for ${canonical}`)
}

/**
 * Spawn the worker process as a hidden background daemon.
 * No console window is shown on any platform.
 */
function spawnInConsole(cmd: string, args: string[], projectPath: string): void {
  const child = spawn(cmd, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    cwd: projectPath,
  })
  child.unref()
}

async function checkHealth(port: number): Promise<boolean> {
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: AbortSignal.timeout(2000),
    })
    return resp.ok
  } catch {
    return false
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
