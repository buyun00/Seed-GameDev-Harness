#!/usr/bin/env node
/**
 * Seed Session End Hook
 *
 * - Writes session metrics to .seed/sessions/{sessionId}.json
 * - Cleans up transient state files
 */

import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';

const SEED_DIR = '.seed';

async function main() {
  try {
    const input = await readStdin(1000);
    let data = {};
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const cwd = data.cwd || data.directory || process.cwd();
    const sessionId = data.session_id || data.sessionId || '';
    const now = new Date().toISOString();

    // 1. Write session record
    if (sessionId) {
      const sessionsDir = join(cwd, SEED_DIR, 'sessions');
      if (!existsSync(sessionsDir)) {
        mkdirSync(sessionsDir, { recursive: true });
      }

      const sessionRecord = {
        sessionId,
        started_at: data.started_at || data.startedAt || null,
        ended_at: now,
        duration_ms: data.duration_ms || data.durationMs || null
      };

      writeFileSync(
        join(sessionsDir, `${sessionId}.json`),
        JSON.stringify(sessionRecord, null, 2)
      );
    }

    // 2. Clean up transient state files
    const stateDir = join(cwd, SEED_DIR, 'state');
    if (existsSync(stateDir)) {
      try {
        const files = readdirSync(stateDir);
        for (const file of files) {
          if (file.endsWith('-stop-breaker.json') || file.startsWith('hud-')) {
            try {
              unlinkSync(join(stateDir, file));
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
    }

    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
