#!/usr/bin/env node
/**
 * PreCompact Hook: Project Memory Preservation
 *
 * Reads .seed/project-memory.json and returns a formatted summary
 * as systemMessage so it survives compaction. Does NOT write any files.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';
import { formatContextSummary } from './lib/memory-formatter.mjs';

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

    const summary = formatContextSummary(memory);
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
