#!/usr/bin/env node
/**
 * researcher-copy-template.mjs
 * 将 templates/researcher/researcher.md 复制为带时间戳的工作文件。
 *
 * 用法：node scripts/run.cjs scripts/researcher-copy-template.mjs [--output .seed/output/]
 * 输出：工作文件路径（stdout）
 */

import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';
const args = process.argv.slice(2);

const outputIdx = args.indexOf('--output');
const outputDir = outputIdx !== -1 ? args[outputIdx + 1] : '.seed/output';

const templatePath = join(pluginRoot, 'templates', 'researcher', 'researcher.md');

if (!existsSync(templatePath)) {
  console.error(`× 模板文件不存在: ${templatePath}`);
  process.exit(1);
}

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

const outputPath = join(outputDir, `researcher-${timestamp}.md`);

copyFileSync(templatePath, outputPath);
console.log(outputPath);
