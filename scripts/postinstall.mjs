import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const memoryServerDir = join(projectRoot, 'memory-server')
const workerDist = join(memoryServerDir, 'dist', 'worker.cjs')

if (existsSync(workerDist)) {
  process.exit(0)
}

process.stderr.write('[Seed] Pre-built artifacts not found, building memory-server...\n')

const proc = spawn('npm', ['run', 'build'], {
  cwd: memoryServerDir,
  stdio: 'inherit',
  shell: true,
})

proc.on('exit', (code) => {
  if (code !== 0) {
    process.stderr.write(`[Seed] Build failed with code ${code}. Run "npm run build" manually.\n`)
  }
  process.exit(code ?? 0)
})
