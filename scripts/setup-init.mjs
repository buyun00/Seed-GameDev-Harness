#!/usr/bin/env node
/**
 * Seed 初始化 Hook（SessionStart:init）
 *
 * 在首次 session 时创建 .seed/ 运行时目录结构。
 * 如果默认配置和路由表模板不存在则复制它们。
 */

import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';

const SEED_DIR = '.seed';
const DIRS = [
  join(SEED_DIR, 'state'),
  join(SEED_DIR, 'state', 'checkpoints'),
  join(SEED_DIR, 'logs'),
  join(SEED_DIR, 'plans'),
];

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch { /* 忽略 */ }

    const cwd = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(cwd, '..');

    // 创建运行时目录
    for (const dir of DIRS) {
      const fullPath = join(cwd, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }

    // 如果不存在则复制默认配置
    const configDest = join(cwd, SEED_DIR, 'config.json');
    if (!existsSync(configDest)) {
      const configSrc = join(pluginRoot, 'templates', 'config.json');
      if (existsSync(configSrc)) {
        copyFileSync(configSrc, configDest);
      }
    }

    // 如果不存在则复制默认路由表
    const routerDest = join(cwd, SEED_DIR, 'team-router.md');
    if (!existsSync(routerDest)) {
      const routerSrc = join(pluginRoot, 'templates', 'team-router.md');
      if (existsSync(routerSrc)) {
        copyFileSync(routerSrc, routerDest);
      }
    }

    console.log(JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'Setup',
        additionalContext: 'Seed 已初始化'
      }
    }));
  } catch (error) {
    console.error('[setup-init] 错误:', error.message);
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
