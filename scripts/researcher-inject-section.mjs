#!/usr/bin/env node
/**
 * researcher-inject-section.mjs
 * 将临时文件的内容注入到工作文件的指定占位符位置。
 *
 * 用法：node scripts/run.cjs scripts/researcher-inject-section.mjs --file [工作文件路径] --placeholder [占位符] --from [临时文件路径]
 *
 * 示例：
 *   node scripts/run.cjs scripts/researcher-inject-section.mjs \
 *     --file .seed/output/researcher-20260413-0017.md \
 *     --placeholder {task_contract} \
 *     --from .seed/output/.section-temp.md
 *
 * 注入完成后自动删除临时文件。
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';

const args = process.argv.slice(2);
const fileIdx        = args.indexOf('--file');
const placeholderIdx = args.indexOf('--placeholder');
const fromIdx        = args.indexOf('--from');

const workFile    = fileIdx        !== -1 ? args[fileIdx        + 1] : null;
const placeholder = placeholderIdx !== -1 ? args[placeholderIdx + 1] : null;
const tempFile    = fromIdx        !== -1 ? args[fromIdx        + 1] : null;

if (!workFile || !placeholder || !tempFile) {
  console.error('× 用法: researcher-inject-section.mjs --file [path] --placeholder [占位符] --from [temp_file]');
  process.exit(1);
}

if (!existsSync(workFile)) {
  console.error(`× 工作文件不存在: ${workFile}`);
  process.exit(1);
}

if (!existsSync(tempFile)) {
  console.error(`× 临时文件不存在: ${tempFile}`);
  process.exit(1);
}

const workContent = readFileSync(workFile, 'utf8');
if (!workContent.includes(placeholder)) {
  console.error(`× 工作文件中未找到占位符: ${placeholder}`);
  process.exit(1);
}

const sectionContent = readFileSync(tempFile, 'utf8').trim();
const updated = workContent.replace(placeholder, sectionContent);

writeFileSync(workFile, updated, 'utf8');
unlinkSync(tempFile);

console.log(`✓ 已注入 ${placeholder} → ${workFile}`);
