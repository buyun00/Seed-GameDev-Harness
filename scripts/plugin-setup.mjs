#!/usr/bin/env node
/**
 * Seed 插件安装后配置脚本
 *
 * 在插件安装后自动运行。
 * - 将 node 二进制路径保存到 ~/.claude/.seed-config.json
 * - 修补 hooks.json 以使用绝对 node 二进制路径
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getClaudeConfigDir } from './lib/config-dir.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAUDE_DIR = getClaudeConfigDir();
const nodeBin = process.execPath || 'node';

console.log('[Seed] 正在运行安装后配置...');

// 1. 将 node 二进制路径持久化到 .seed-config.json
try {
  const configPath = join(CLAUDE_DIR, '.seed-config.json');
  let seedConfig = {};
  if (existsSync(configPath)) {
    seedConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  }
  if (nodeBin !== 'node') {
    seedConfig.nodeBinary = nodeBin;
    writeFileSync(configPath, JSON.stringify(seedConfig, null, 2));
    console.log(`[Seed] 已保存 node 二进制路径: ${nodeBin}`);
  }
} catch (e) {
  console.log('[Seed] 警告: 无法保存 node 二进制路径（非致命）:', e.message);
}

// 2. 修补 hooks.json 以使用绝对 node 二进制路径。
//    否则 nvm/fnm 用户和 Windows 用户在非交互式 shell 中会遇到 "node not found" 错误。
try {
  const hooksJsonPath = join(__dirname, '..', 'hooks', 'hooks.json');
  if (existsSync(hooksJsonPath)) {
    const data = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
    let patched = false;

    for (const groups of Object.values(data.hooks ?? {})) {
      for (const group of groups) {
        for (const hook of (group.hooks ?? [])) {
          if (typeof hook.command !== 'string') continue;

          // 将裸 `node` 替换为绝对路径
          if (hook.command.startsWith('node ') && hook.command.includes('/scripts/run.cjs')) {
            hook.command = hook.command.replace(/^node\b/, `"${nodeBin}"`);
            patched = true;
            continue;
          }

          // 自愈机制：重写过期的绝对 node 路径
          const absNodeMatch = hook.command.match(
            /^"([^"]*\/node|[A-Za-z]:\\[^"]*\\node(?:\.exe)?)"\s+.*\/scripts\/run\.cjs/,
          );
          if (absNodeMatch) {
            const currentBin = absNodeMatch[1];
            if (currentBin !== nodeBin && (!existsSync(currentBin) || currentBin.includes('/hostedtoolcache/'))) {
              hook.command = hook.command.replace(/^"[^"]*"/, `"${nodeBin}"`);
              patched = true;
            }
          }
        }
      }
    }

    if (patched) {
      writeFileSync(hooksJsonPath, JSON.stringify(data, null, 2) + '\n');
      console.log(`[Seed] 已修补 hooks.json 的绝对 node 路径 (${nodeBin})`);
    }
  }
} catch (e) {
  console.log('[Seed] 警告: 无法修补 hooks.json:', e.message);
}

console.log('[Seed] 配置完成！重启 Claude Code 以激活。');
