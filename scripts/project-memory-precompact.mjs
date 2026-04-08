#!/usr/bin/env node
/**
 * PreCompact Hook：项目记忆保护
 *
 * 读取 .seed/project-memory.json 并返回格式化摘要
 * 作为 systemMessage，使其在压缩后存活。不写入任何文件。
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
        hookEventName: 'PreCompact',
        systemMessage: summary
      }
    }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
