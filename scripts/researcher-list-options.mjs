#!/usr/bin/env node
/**
 * researcher-list-options.mjs
 * 列出 templates/researcher/mf/ 或 templates/researcher/tools/ 目录下所有可用选项的 ID 和一行描述。
 *
 * 用法：node scripts/run.cjs scripts/researcher-list-options.mjs --type mf|skill
 * 输出：每行格式为  ID | 描述
 *
 * 描述来源（按优先级）：
 *   1. 文件 frontmatter 中的 description 字段
 *   2. 文件第一个非空的正文行（去掉 # 前缀）
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';
const args = process.argv.slice(2);

const typeIdx = args.indexOf('--type');
const type = typeIdx !== -1 ? args[typeIdx + 1] : null;

if (!type || !['mf', 'skill'].includes(type)) {
  console.error('× 用法: researcher-list-options.mjs --type mf|skill');
  process.exit(1);
}

const dir = type === 'mf'
  ? join(pluginRoot, 'templates', 'researcher', 'mf')
  : join(pluginRoot, 'templates', 'researcher', 'tools');

if (!existsSync(dir)) {
  console.error(`× 目录不存在: ${dir}`);
  process.exit(1);
}

const files = readdirSync(dir)
  .filter(f => f.endsWith('.md'))
  .sort();

if (files.length === 0) {
  console.log('（无可用选项）');
  process.exit(0);
}

files.forEach(file => {
  const id = basename(file, '.md');
  const content = readFileSync(join(dir, file), 'utf8');
  const description = extractDescription(content);
  console.log(`${id} | ${description}`);
});

function extractDescription(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
    if (descMatch) return descMatch[1].trim();
  }
  const body = content.replace(/^---[\s\S]*?---\r?\n?/, '');
  for (const line of body.split('\n')) {
    const trimmed = line.replace(/^#+\s*/, '').trim();
    if (trimmed) return trimmed;
  }
  return '（无描述）';
}
