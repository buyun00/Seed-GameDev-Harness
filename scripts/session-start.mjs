#!/usr/bin/env node
/**
 * Seed Session 启动 Hook
 *
 * 注入 notepad 的 Priority Context 和轻量级 team 状态提示。
 * 不操作 project-memory.json（那是 project-memory-session.mjs 的职责）。
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';
import { readLanguageConfig, buildLanguageDirective, t } from './lib/i18n.mjs';

const SEED_DIR = '.seed';
const NOTEPAD_FILE = 'notepad.md';

/**
 * 从 notepad.md 中提取 "Priority Context" 段落。
 * 查找以 "# Priority Context" 或 "## Priority Context" 开头的标题，
 * 读取到下一个同级或更高级标题为止。
 */
function extractPriorityContext(notepadContent) {
  const lines = notepadContent.split('\n');
  const result = [];
  let capturing = false;

  for (const line of lines) {
    if (/^#{1,2}\s+Priority\s+Context/i.test(line)) {
      capturing = true;
      continue;
    }
    if (capturing && /^#{1,2}\s+/.test(line)) {
      break;
    }
    if (capturing) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch { /* 忽略 */ }

    const cwd = data.cwd || data.directory || process.cwd();
    const lang = readLanguageConfig(cwd);
    const parts = [];

    // 0. 语言指令（最高优先级 — 最先注入）
    const langDirective = buildLanguageDirective(lang);
    if (langDirective) {
      parts.push(langDirective);
    }

    // 1. Notepad Priority Context
    const notepadPath = join(cwd, SEED_DIR, NOTEPAD_FILE);
    if (existsSync(notepadPath)) {
      try {
        const content = readFileSync(notepadPath, 'utf-8');
        const priority = extractPriorityContext(content);
        if (priority) {
          parts.push('### [Priority Context]\n' + priority);
        }
      } catch { /* 忽略读取错误 */ }
    }

    // 2. 轻量级 team 状态提示
    parts.push(t(lang, 'teamStatusTip'));

    if (parts.length === 0) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    console.log(JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: parts.join('\n\n')
      }
    }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
