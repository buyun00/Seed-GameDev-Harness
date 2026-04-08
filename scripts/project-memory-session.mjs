#!/usr/bin/env node
/**
 * SessionStart Hook: Project Memory Injection
 *
 * Reads .seed/project-memory.json and injects a formatted summary
 * into the session context. This is the sole injection point for
 * project memory — session-start.mjs handles other context.
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
    try { data = JSON.parse(input); } catch { /* ignore */ }

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
