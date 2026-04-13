#!/usr/bin/env node
/**
 * researcher-fill-options.mjs
 * 将选中的 MF 或 Tool Skill 内容写入工作文件的对应占位符。
 *
 * 用法：node scripts/run.cjs scripts/researcher-fill-options.mjs --file [工作文件路径] --type mf|skill --ids [id1,id2,...]
 *
 * --type mf    替换占位符 {selected_method_fragments}，内容来自 templates/researcher/mf/
 * --type skill 替换占位符 {selected_tool_skills}，内容来自 templates/researcher/tools/
 *
 * 多个 ID 时按顺序拼接，MF 之间插入分隔线，Tool Skills 之间换行。
 * 写入前会自动剥离各文件的 frontmatter。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';
const args = process.argv.slice(2);

const fileIdx  = args.indexOf('--file');
const typeIdx  = args.indexOf('--type');
const idsIdx   = args.indexOf('--ids');

const workFile = fileIdx  !== -1 ? args[fileIdx  + 1] : null;
const type     = typeIdx  !== -1 ? args[typeIdx  + 1] : null;
const idsRaw   = idsIdx   !== -1 ? args[idsIdx   + 1] : null;

if (!workFile || !type || !idsRaw) {
  console.error('× 用法: researcher-fill-options.mjs --file [path] --type mf|skill --ids [id1,id2,...]');
  process.exit(1);
}

if (!['mf', 'skill'].includes(type)) {
  console.error('× --type 必须为 mf 或 skill');
  process.exit(1);
}

if (!existsSync(workFile)) {
  console.error(`× 工作文件不存在: ${workFile}`);
  process.exit(1);
}

const ids = idsRaw.split(',').map(s => s.trim()).filter(Boolean);
if (ids.length === 0) {
  console.error('× --ids 不能为空');
  process.exit(1);
}

const dir         = type === 'mf'
  ? join(pluginRoot, 'templates', 'researcher', 'mf')
  : join(pluginRoot, 'templates', 'researcher', 'tools');
const placeholder = type === 'mf' ? '{selected_method_fragments}' : '{selected_tool_skills}';
const separator   = type === 'mf' ? '\n\n---\n\n' : '\n\n';

const contents = ids.map(id => {
  const filePath = join(dir, `${id}.md`);
  if (!existsSync(filePath)) {
    console.error(`× 文件不存在: ${filePath}`);
    process.exit(1);
  }
  return stripFrontmatter(readFileSync(filePath, 'utf8')).trim();
});

const combined = contents.join(separator);

let workContent = readFileSync(workFile, 'utf8');
if (!workContent.includes(placeholder)) {
  console.error(`× 工作文件中未找到占位符: ${placeholder}`);
  process.exit(1);
}

workContent = workContent.replace(placeholder, combined);
writeFileSync(workFile, workContent, 'utf8');

console.log(`✓ 已写入 ${placeholder}（${ids.length} 项：${ids.join(', ')}）→ ${workFile}`);

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}
