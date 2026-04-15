import { spawn } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
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
 * background daemon and polls health until ready.
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
    // PID alive but HTTP not responding — stale, fall through to respawn
  }

  const port = opts?.port ?? 0
  const timeoutMs = opts?.timeoutMs ?? 15_000

  // Resolve the entry script — this file lives in server/worker/, the entry is server/index.ts
  const thisDir = __dirname
  const entryScript = resolve(thisDir, '..', 'index.ts')
  const entryScriptJs = resolve(thisDir, '..', 'index.js')

  // Prefer compiled .js if it exists (production), otherwise .ts with tsx (dev)
  let cmd: string
  let args: string[]
  try {
    const { existsSync } = await import('node:fs')
    if (existsSync(entryScriptJs)) {
      cmd = process.execPath
      args = [entryScriptJs, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
    } else {
      cmd = process.execPath
      const tsxBin = resolve(thisDir, '..', '..', 'node_modules', '.bin', 'tsx')
      if (existsSync(tsxBin) || existsSync(tsxBin + '.cmd')) {
        cmd = process.platform === 'win32' ? tsxBin + '.cmd' : tsxBin
        args = [entryScript, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
      } else {
        // Fallback: assume tsx is globally available
        cmd = 'npx'
        args = ['tsx', entryScript, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
      }
    }
  } catch {
    cmd = process.execPath
    args = [entryScriptJs, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
  }

  const child = spawn(cmd, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    shell: process.platform === 'win32',
  })
  child.unref()

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
