#!/usr/bin/env node
/**
 * SessionStart Hook：项目记忆注入
 *
 * 读取 .seed/project-memory.json 并将格式化摘要注入
 * session 上下文。这是项目记忆的唯一注入点 —
 * session-start.mjs 负责处理其他上下文。
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';
import { formatContextSummary } from './lib/memory-formatter.mjs';
import { readLanguageConfig } from './lib/i18n.mjs';

const SEED_DIR = '.seed';
const MEMORY_FILE = 'project-memory.json';

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch { /* 忽略 */ }

    const cwd = data.cwd || data.directory || process.cwd();
    const memoryPath = join(cwd, SEED_DIR, MEMORY_FILE);

    if (!existsSync(memoryPath)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    let memory;
    try {
      memory = JSON.parse(readFileSync(memoryPath, 'utf-8'));
    } catch {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const lang = readLanguageConfig(cwd);
    const summary = formatContextSummary(memory, lang);
    if (!summary) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    console.log(JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: summary
      }
    }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
