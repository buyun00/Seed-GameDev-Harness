#!/usr/bin/env node
/**
 * Seed Setup Init Hook (SessionStart:init)
 *
 * Creates the .seed/ runtime directory structure on first session.
 * Copies default config and team-router templates if they don't exist.
 */

import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';

const SEED_DIR = '.seed';
const DIRS = [
  join(SEED_DIR, 'state'),
  join(SEED_DIR, 'state', 'checkpoints'),
  join(SEED_DIR, 'logs'),
  join(SEED_DIR, 'plans'),
];

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const cwd = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(cwd, '..');

    // Create runtime directories
    for (const dir of DIRS) {
      const fullPath = join(cwd, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }

    // Copy default config if not present
    const configDest = join(cwd, SEED_DIR, 'config.json');
    if (!existsSync(configDest)) {
      const configSrc = join(pluginRoot, 'templates', 'config.json');
      if (existsSync(configSrc)) {
        copyFileSync(configSrc, configDest);
      }
    }

    // Copy default team-router if not present
    const routerDest = join(cwd, SEED_DIR, 'team-router.md');
    if (!existsSync(routerDest)) {
      const routerSrc = join(pluginRoot, 'templates', 'team-router.md');
      if (existsSync(routerSrc)) {
        copyFileSync(routerSrc, routerDest);
      }
    }

    console.log(JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'Setup',
        additionalContext: 'Seed initialized'
      }
    }));
  } catch (error) {
    console.error('[setup-init] Error:', error.message);
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
