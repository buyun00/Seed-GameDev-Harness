#!/usr/bin/env node
'use strict';
/**
 * 跨平台 hook 执行器 (run.cjs)
 *
 * 使用 process.execPath（运行本脚本的 Node 二进制路径）来 spawn
 * 目标 .mjs hook，绕过 PATH / shell 发现问题。
 *
 * 用法（从 hooks.json 调用，安装时已修补为绝对 node 路径）：
 *   /abs/path/to/node "${CLAUDE_PLUGIN_ROOT}/scripts/run.cjs" \
 *       "${CLAUDE_PLUGIN_ROOT}/scripts/<hook>.mjs" [args...]
 *
 * 安装后配置阶段会将开头的 `node` token 替换为
 * process.execPath，确保 nvm/fnm 用户和 Windows 用户都能找到正确的二进制。
 */

const { spawnSync } = require('child_process');
const { existsSync, realpathSync } = require('fs');
const { join, basename, dirname } = require('path');

const target = process.argv[2];
if (!target) {
  // 没有要执行的目标 — 干净退出，确保 Claude Code hooks 永远不被阻塞。
  process.exit(0);
}

/**
 * 解析 hook 脚本目标路径，处理过期的 CLAUDE_PLUGIN_ROOT。
 *
 * 解析策略：
 *   1. 如果目标路径直接存在，直接使用。
 *   2. 尝试通过 realpathSync 解析（跟随符号链接）。
 *   3. 扫描插件缓存目录，查找包含相同脚本名的最新可用版本。
 *   4. 如果都失败，返回 null（调用方干净退出）。
 */
function resolveTarget(targetPath) {
  // 快速路径：目标存在（常见情况）
  if (existsSync(targetPath)) return targetPath;

  // 尝试 realpath 解析（处理指向其他位置的损坏符号链接）
  try {
    const resolved = realpathSync(targetPath);
    if (existsSync(resolved)) return resolved;
  } catch {
    // realpathSync 在路径完全不存在时抛异常 — 属于预期
  }

  // 回退：在插件缓存中查找最新版本的同名脚本
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
    if (!pluginRoot) return null;

    const cacheBase = dirname(pluginRoot);
    const scriptRelative = targetPath.slice(pluginRoot.length);

    if (!scriptRelative || !existsSync(cacheBase)) return null;

    const { readdirSync } = require('fs');
    const entries = readdirSync(cacheBase).filter(v => /^\d+\.\d+\.\d+/.test(v));

    // 按语义版本号降序排列
    entries.sort((a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
      }
      return 0;
    });

    for (const version of entries) {
      const candidate = join(cacheBase, version) + scriptRelative;
      if (existsSync(candidate)) return candidate;
    }
  } catch {
    // 回退扫描中的任何错误 — 优雅放弃
  }

  return null;
}

const resolved = resolveTarget(target);
if (!resolved) {
  // 到处都找不到目标 — 干净退出，确保 hooks 永远不被阻塞。
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [resolved, ...process.argv.slice(3)],
  {
    stdio: 'inherit',
    env: process.env,
    windowsHide: true,
  }
);

// 传播子进程退出码（null → 0 以避免阻塞 hooks）。
process.exit(result.status ?? 0);
