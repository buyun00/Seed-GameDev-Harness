#!/usr/bin/env node
/**
 * Seed Worker 启动 Hook
 *
 * 在 SessionStart 时确保 worker 进程正在运行。
 * 从 hook stdin 获取 cwd（项目路径），启动对应项目的 worker。
 */

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const cwd = data.cwd || data.directory || process.cwd();

    if (!cwd || cwd === process.cwd()) {
      process.stderr.write('[Seed Worker] Warning: using process.cwd() as project path\n');
    }

    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(import.meta.dirname || '.', '..');
    const workerScript = join(pluginRoot, 'scripts', 'worker-service.cjs');

    const result = spawnSync(
      process.execPath,
      [workerScript, 'start', '--project-path', cwd],
      {
        stdio: ['pipe', 'pipe', 'inherit'],
        env: process.env,
        windowsHide: true,
        timeout: 20_000,
      }
    );

    if (result.status === 0 && result.stdout) {
      try {
        const info = JSON.parse(result.stdout.toString());
        if (info.port) {
          process.stderr.write(`[Seed Worker] Ready on port ${info.port}\n`);
        }
      } catch { /* ignore parse errors */ }
    }

    // Always continue — don't block the session
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch (err) {
    process.stderr.write(`[Seed Worker] Hook error: ${err}\n`);
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
