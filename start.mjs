import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = process.cwd()
const seedDir = join(projectRoot, '.seed')

function findFreePort(start = 18080) {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(start, '127.0.0.1', () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', () => {
      resolve(findFreePort(start + 1))
    })
  })
}

function resolveMemoryServerDir() {
  const candidates = [
    join(__dirname, 'memory-server'),
    join(__dirname, '..', 'memory-server'),
    join(projectRoot, 'memory-server'),
  ]
  for (const p of candidates) {
    if (existsSync(join(p, 'package.json'))) return p
  }
  throw new Error('Cannot find memory-server directory')
}

async function main() {
  const memoryServerDir = resolveMemoryServerDir()
  const workerScript = join(memoryServerDir, 'dist', 'server', 'index.js')

  if (!existsSync(workerScript)) {
    process.stderr.write('[Seed] Building memory-server first...\n')
    await new Promise((resolve, reject) => {
      const proc = spawn('npm', ['run', 'build'], {
        cwd: memoryServerDir,
        stdio: 'inherit',
        shell: true,
      })
      proc.on('exit', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Build failed with exit code ${code}`))
      })
    })
  }

  const port = await findFreePort(18080)
  process.stderr.write(`[Seed] Starting server on port ${port}...\n`)

  const worker = spawn('node', [workerScript, 'daemon', '--project-path', projectRoot, '--port', String(port)], {
    cwd: memoryServerDir,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      SEED_PROJECT_ROOT: projectRoot,
      SEED_HOST: '127.0.0.1',
      SEED_PORT: String(port),
    },
    windowsHide: true,
  })

  worker.on('exit', (code) => {
    process.stderr.write(`[Seed] Worker exited with code ${code}\n`)
    process.exit(code ?? 0)
  })

  const url = `http://127.0.0.1:${port}/`
  process.stderr.write(`[Seed] Server URL: ${url}\n`)

  if (!existsSync(seedDir)) {
    mkdirSync(seedDir, { recursive: true })
  }
  writeFileSync(join(seedDir, 'memory-editor.url'), url, 'utf-8')

  const ready = await waitForReady(port)
  if (ready) {
    const { default: open } = await import('open')
    await open(url)
    process.stderr.write(`[Seed] Browser opened at ${url}\n`)
  } else {
    process.stderr.write('[Seed] Server did not become ready in time.\n')
  }

  process.on('SIGINT', () => {
    worker.kill('SIGINT')
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    worker.kill('SIGTERM')
    process.exit(0)
  })
}

function waitForReady(port, timeoutMs = 15000) {
  const start = Date.now()
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        resolve(false)
        return
      }
      try {
        const resp = await fetch(`http://127.0.0.1:${port}/api/health`)
        if (resp.ok) {
          clearInterval(interval)
          resolve(true)
        }
      } catch {}
    }, 500)
  })
}

main().catch((err) => {
  process.stderr.write(`[Seed] Error: ${err}\n`)
  process.exit(1)
})
