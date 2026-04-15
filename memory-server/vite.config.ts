import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve, join } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { homedir } from 'os'

function resolveWorkerPort(): number {
  const defaultPort = 51966
  try {
    const workersDir = join(homedir(), '.seed', 'workers')
    if (!existsSync(workersDir)) return defaultPort
    const files = readdirSync(workersDir).filter(f => f.endsWith('.pid'))
    for (const file of files) {
      try {
        const info = JSON.parse(readFileSync(join(workersDir, file), 'utf-8'))
        if (info.port) return info.port
      } catch { /* skip */ }
    }
  } catch { /* ignore */ }
  return defaultPort
}

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${resolveWorkerPort()}`,
        changeOrigin: true,
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
      },
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
})
