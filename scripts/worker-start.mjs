#!/usr/bin/env node
/**
 * Seed Worker 启动 Hook
 *
 * 在 SessionStart 时确保 worker 进程正在运行。
 * 从 hook stdin 获取 cwd（项目路径），启动对应项目的 worker。
 */

import { spawnSync, spawn } from 'node:child_process';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { readStdin } from './lib/stdin.mjs';

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

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

    let url = '';
    if (result.status === 0 && result.stdout) {
      try {
        const info = JSON.parse(result.stdout.toString());
        if (info.port) {
          url = `http://127.0.0.1:${info.port}/`;

          // Write URL to project .seed/ for easy discovery
          const seedDir = join(cwd, '.seed');
          if (!existsSync(seedDir)) {
            mkdirSync(seedDir, { recursive: true });
          }
          writeFileSync(join(seedDir, 'memory-editor.url'), url, 'utf-8');

          // Open the Memory Editor UI in the default browser
          openBrowser(url);
        }
      } catch { /* ignore parse errors */ }
    }

    if (url) {
      console.log(JSON.stringify({
        continue: true,
        stopReason: `[Memory Editor] ${url}`,
      }));
    } else {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    }
  } catch (err) {
    process.stderr.write(`[Seed Worker] Hook error: ${err}\n`);
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
