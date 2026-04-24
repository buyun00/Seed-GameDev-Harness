import { resolve, sep } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs'
import { join } from 'node:path'
import { execSync, spawnSync } from 'node:child_process'

export interface PidInfo {
  pid: number
  port: number
  projectPath: string
  startedAt: string
}

const WORKERS_DIR = join(homedir(), '.seed', 'workers')

function ensureWorkersDir(): void {
  if (!existsSync(WORKERS_DIR)) {
    mkdirSync(WORKERS_DIR, { recursive: true })
  }
}

/**
 * Normalize a project path to a canonical form so that the same working tree
 * always produces the same slug regardless of casing, symlinks, or sub-directory entry.
 *
 * Rules (in order):
 *   1. path.resolve → absolute
 *   2. fs.realpathSync → resolve symlinks
 *   3. git: --show-toplevel to lift sub-dirs to the working-tree root
 *      (works for both normal repos and worktrees — returns the worktree root,
 *       NOT the main repo root, so different worktrees stay isolated)
 *   4. Windows: upper-case drive letter, lower-case remainder
 *   5. Normalise separators to '/'
 */
export function canonicalizeProjectPath(rawPath: string): string {
  let p = resolve(rawPath)

  try {
    p = realpathSync(p)
  } catch {
    // realpathSync may throw if the path doesn't fully exist
  }

  if (existsSync(join(p, '.git')) || existsSync(join(p, '..', '.git'))) {
    try {
      const toplevel = execSync('git rev-parse --show-toplevel', {
        cwd: p,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000,
      }).trim()
      if (toplevel) {
        p = resolve(toplevel)
      }
    } catch {
      // Not a git repo or git not available — keep resolved path
    }
  }

  // Windows: only normalise the drive letter to uppercase, preserve the rest
  if (process.platform === 'win32' && /^[a-zA-Z]:/.test(p)) {
    p = p[0].toUpperCase() + p.slice(1)
  }

  return p.split(sep).join('/')
}

export function getProjectSlug(canonicalPath: string): string {
  return createHash('sha256').update(canonicalPath).digest('hex').slice(0, 12)
}

export function getWorkerPidPath(canonicalPath: string): string {
  ensureWorkersDir()
  return join(WORKERS_DIR, `worker-${getProjectSlug(canonicalPath)}.pid`)
}

export function writePidFile(canonicalPath: string, info: PidInfo): void {
  ensureWorkersDir()
  const pidPath = getWorkerPidPath(canonicalPath)
  writeFileSync(pidPath, JSON.stringify(info, null, 2), 'utf-8')
}

export function readPidFile(canonicalPath: string): PidInfo | null {
  const pidPath = getWorkerPidPath(canonicalPath)
  if (!existsSync(pidPath)) return null
  try {
    return JSON.parse(readFileSync(pidPath, 'utf-8')) as PidInfo
  } catch {
    // Corrupt file — remove it
    try { unlinkSync(pidPath) } catch { /* ignore */ }
    return null
  }
}

export function removePidFile(canonicalPath: string): void {
  const pidPath = getWorkerPidPath(canonicalPath)
  try { unlinkSync(pidPath) } catch { /* ignore */ }
}

export function isProcessAlive(pid: number): boolean {
  if (process.platform === 'win32') {
    try {
      const result = spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000,
        windowsHide: true,
      })
      return result.status === 0 && result.stdout.includes(String(pid))
    } catch {
      return false
    }
  }

  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function validatePidFile(canonicalPath: string): 'alive' | 'stale' | 'missing' {
  const info = readPidFile(canonicalPath)
  if (!info) return 'missing'
  if (isProcessAlive(info.pid)) return 'alive'
  removePidFile(canonicalPath)
  return 'stale'
}

export function listAllWorkers(): Array<PidInfo & { status: 'alive' | 'stale' }> {
  ensureWorkersDir()
  const results: Array<PidInfo & { status: 'alive' | 'stale' }> = []
  try {
    const files = readdirSync(WORKERS_DIR).filter(f => f.endsWith('.pid'))
    for (const file of files) {
      const fullPath = join(WORKERS_DIR, file)
      try {
        const info = JSON.parse(readFileSync(fullPath, 'utf-8')) as PidInfo
        const alive = isProcessAlive(info.pid)
        if (!alive) {
          try { unlinkSync(fullPath) } catch { /* ignore */ }
        }
        results.push({ ...info, status: alive ? 'alive' : 'stale' })
      } catch {
        try { unlinkSync(fullPath) } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
  return results.filter(r => r.status === 'alive')
}
