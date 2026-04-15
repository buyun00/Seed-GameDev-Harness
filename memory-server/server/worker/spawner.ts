import { spawn } from 'node:child_process'
import { join, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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
 * Spawn the worker process in a visible console window.
 * - Windows: `start "title" cmd /c "command"`
 * - macOS: `open -a Terminal`
 * - Linux: try common terminal emulators
 */
function spawnInConsole(cmd: string, args: string[], projectPath: string): void {
  const projectName = projectPath.split(/[/\\]/).filter(Boolean).pop() || 'project'
  const title = `Seed Memory Editor - ${projectName}`

  if (process.platform === 'win32') {
    // Write a temp .cmd file to avoid Windows cmd.exe quote-stripping issues.
    // `start ""` with an empty title prevents the first quoted arg from being
    // consumed as the window title.
    const innerCmd = [cmd, ...args]
      .map(a => (a.includes(' ') ? `"${a}"` : a))
      .join(' ')
    const batPath = join(tmpdir(), `seed-worker-${Date.now()}.cmd`)
    writeFileSync(
      batPath,
      `@echo off\r\ntitle ${title}\r\n${innerCmd}\r\necho.\r\necho Worker process exited. Press any key to close...\r\npause >nul\r\n`,
      'utf-8',
    )
    const child = spawn('cmd.exe', ['/c', 'start', '""', batPath], {
      detached: true,
      stdio: 'ignore',
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
