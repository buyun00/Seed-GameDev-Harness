import { spawn } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
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
 * daemon process in a visible console window and polls health until ready.
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
  const entryScript = resolve(thisDir, '..', 'index.ts')
  const entryScriptJs = resolve(thisDir, '..', 'index.js')

  let workerCmd: string
  let workerArgs: string[]

  if (existsSync(entryScriptJs)) {
    workerCmd = process.execPath
    workerArgs = [entryScriptJs, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
  } else {
    const tsxBin = resolve(thisDir, '..', '..', 'node_modules', '.bin', 'tsx')
    if (existsSync(tsxBin) || existsSync(tsxBin + '.cmd')) {
      workerCmd = process.platform === 'win32' ? tsxBin + '.cmd' : tsxBin
      workerArgs = [entryScript, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
    } else {
      workerCmd = 'npx'
      workerArgs = ['tsx', entryScript, 'daemon', '--project-path', rawProjectPath, '--port', String(port)]
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
 * Spawn the worker process in a visible console window.
 * - Windows: `start "title" cmd /c "command"`
 * - macOS: `open -a Terminal`
 * - Linux: try common terminal emulators
 */
function spawnInConsole(cmd: string, args: string[], projectPath: string): void {
  const projectName = projectPath.split(/[/\\]/).filter(Boolean).pop() || 'project'
  const title = `Seed Memory Editor - ${projectName}`

  if (process.platform === 'win32') {
    // `start "title" cmd /k "command args..."` opens a new cmd window that stays open
    const fullCmd = [cmd, ...args].map(a => a.includes(' ') ? `"${a}"` : a).join(' ')
    const child = spawn('cmd', ['/c', 'start', `"${title}"`, 'cmd', '/k', fullCmd], {
      detached: true,
      stdio: 'ignore',
      shell: true,
      windowsHide: false,
    })
    child.unref()
  } else if (process.platform === 'darwin') {
    // macOS: use osascript to open Terminal.app
    const fullCmd = [cmd, ...args].map(a => `"${a}"`).join(' ')
    const script = `tell application "Terminal" to do script "${fullCmd}"`
    const child = spawn('osascript', ['-e', script], {
      detached: true,
      stdio: 'ignore',
    })
    child.unref()
  } else {
    // Linux: try common terminal emulators, fallback to detached background
    const terminals = ['gnome-terminal', 'xterm', 'konsole', 'xfce4-terminal']
    let launched = false

    for (const term of terminals) {
      try {
        if (term === 'gnome-terminal') {
          const child = spawn(term, ['--title', title, '--', cmd, ...args], {
            detached: true,
            stdio: 'ignore',
          })
          child.unref()
        } else if (term === 'xterm') {
          const child = spawn(term, ['-T', title, '-e', cmd, ...args], {
            detached: true,
            stdio: 'ignore',
          })
          child.unref()
        } else {
          const child = spawn(term, ['-e', cmd, ...args], {
            detached: true,
            stdio: 'ignore',
          })
          child.unref()
        }
        launched = true
        break
      } catch { /* try next */ }
    }

    if (!launched) {
      // Fallback: background process (no visible window)
      const child = spawn(cmd, args, {
        detached: true,
        stdio: 'ignore',
      })
      child.unref()
    }
  }
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
