#!/usr/bin/env node
/**
 * Seed Session Start Hook
 *
 * Injects notepad Priority Context and a soft team-status hint.
 * Does NOT touch project-memory.json (that's project-memory-session.mjs's job).
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';

const SEED_DIR = '.seed';
const NOTEPAD_FILE = 'notepad.md';

/**
 * Extract the "Priority Context" section from notepad.md.
 * Looks for a heading starting with "# Priority Context" or "## Priority Context"
 * and reads until the next heading of same or higher level.
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
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const cwd = data.cwd || data.directory || process.cwd();
    const parts = [];

    // 1. Notepad Priority Context
    const notepadPath = join(cwd, SEED_DIR, NOTEPAD_FILE);
    if (existsSync(notepadPath)) {
      try {
        const content = readFileSync(notepadPath, 'utf-8');
        const priority = extractPriorityContext(content);
        if (priority) {
          parts.push('### [Priority Context]\n' + priority);
        }
      } catch { /* ignore read errors */ }
    }

    // 2. Soft team-status hint (no actual detection — CC native teams
    //    store state in ~/.claude/teams/, not accessible to Seed)
    parts.push(
      '> Tip: 如果有未完成的 agent team，可用 `/team status` 查看。'
    );

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
