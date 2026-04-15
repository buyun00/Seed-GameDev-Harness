#!/usr/bin/env node
'use strict';
/**
 * Seed Worker 管理 CJS 入口
 *
 * 在生产态加载 esbuild 打包的 worker bundle，
 * 开发态则使用 tsx 直接执行 TypeScript 源码。
 *
 * 用法：
 *   node scripts/worker-service.cjs <start|stop|restart|status|daemon> --project-path <path>
 */

const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const { join, resolve } = require('path');

const SEED_MCP_DIR = join(__dirname, '..', 'memory-server');
const BUNDLE_PATH = join(SEED_MCP_DIR, 'dist', 'worker.cjs');
const SOURCE_PATH = join(SEED_MCP_DIR, 'server', 'index.ts');

const args = process.argv.slice(2);

if (existsSync(BUNDLE_PATH)) {
  // Production: run the self-contained bundle directly
  const result = spawnSync(process.execPath, [BUNDLE_PATH, ...args], {
    stdio: 'inherit',
    env: process.env,
    windowsHide: true,
    cwd: SEED_MCP_DIR,
  });
  process.exit(result.status ?? 0);
} else if (existsSync(SOURCE_PATH)) {
  // Development: run via tsx
  const tsxPaths = [
    join(SEED_MCP_DIR, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx'),
  ];

  let tsxBin = null;
  for (const p of tsxPaths) {
    if (existsSync(p)) { tsxBin = p; break; }
  }

  if (tsxBin) {
    const result = spawnSync(tsxBin, [SOURCE_PATH, ...args], {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
      cwd: SEED_MCP_DIR,
    });
    process.exit(result.status ?? 0);
  } else {
    // Fallback: npx tsx
    const result = spawnSync('npx', ['tsx', SOURCE_PATH, ...args], {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
      cwd: SEED_MCP_DIR,
      shell: true,
    });
    process.exit(result.status ?? 0);
  }
} else {
  process.stderr.write('[Seed Worker] Error: Neither bundle nor source found.\n');
  process.stderr.write(`  Looked for: ${BUNDLE_PATH}\n`);
  process.stderr.write(`         and: ${SOURCE_PATH}\n`);
  process.stderr.write('  Run "cd memory-server && npm run build" first.\n');
  process.exit(1);
}
