#!/usr/bin/env node
/**
 * Seed Plugin Post-Install Setup
 *
 * Runs automatically after plugin installation.
 * - Saves the node binary path to ~/.claude/.seed-config.json
 * - Patches hooks.json to use the absolute node binary path
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getClaudeConfigDir } from './lib/config-dir.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLAUDE_DIR = getClaudeConfigDir();
const nodeBin = process.execPath || 'node';

console.log('[Seed] Running post-install setup...');

// 1. Persist node binary path to .seed-config.json
try {
  const configPath = join(CLAUDE_DIR, '.seed-config.json');
  let seedConfig = {};
  if (existsSync(configPath)) {
    seedConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  }
  if (nodeBin !== 'node') {
    seedConfig.nodeBinary = nodeBin;
    writeFileSync(configPath, JSON.stringify(seedConfig, null, 2));
    console.log(`[Seed] Saved node binary path: ${nodeBin}`);
  }
} catch (e) {
  console.log('[Seed] Warning: Could not save node binary path (non-fatal):', e.message);
}

// 2. Patch hooks.json to use absolute node binary path.
//    Without this, nvm/fnm users and Windows users get "node not found" errors
//    in non-interactive shells.
try {
  const hooksJsonPath = join(__dirname, '..', 'hooks', 'hooks.json');
  if (existsSync(hooksJsonPath)) {
    const data = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
    let patched = false;

    for (const groups of Object.values(data.hooks ?? {})) {
      for (const group of groups) {
        for (const hook of (group.hooks ?? [])) {
          if (typeof hook.command !== 'string') continue;

          // Replace bare `node` with absolute path
          if (hook.command.startsWith('node ') && hook.command.includes('/scripts/run.cjs')) {
            hook.command = hook.command.replace(/^node\b/, `"${nodeBin}"`);
            patched = true;
            continue;
          }

          // Self-healing: rewrite stale absolute node paths
          const absNodeMatch = hook.command.match(
            /^"([^"]*\/node|[A-Za-z]:\\[^"]*\\node(?:\.exe)?)"\s+.*\/scripts\/run\.cjs/,
          );
          if (absNodeMatch) {
            const currentBin = absNodeMatch[1];
            if (currentBin !== nodeBin && (!existsSync(currentBin) || currentBin.includes('/hostedtoolcache/'))) {
              hook.command = hook.command.replace(/^"[^"]*"/, `"${nodeBin}"`);
              patched = true;
            }
          }
        }
      }
    }

    if (patched) {
      writeFileSync(hooksJsonPath, JSON.stringify(data, null, 2) + '\n');
      console.log(`[Seed] Patched hooks.json with absolute node path (${nodeBin})`);
    }
  }
} catch (e) {
  console.log('[Seed] Warning: Could not patch hooks.json:', e.message);
}

console.log('[Seed] Setup complete! Restart Claude Code to activate.');
