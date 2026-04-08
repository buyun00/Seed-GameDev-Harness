#!/usr/bin/env node
/**
 * PostToolUse Hook: Project Memory Update
 *
 * After Write/Edit/MultiEdit operations, updates the hotPaths index
 * in .seed/project-memory.json via atomic write.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { readStdin } from './lib/stdin.mjs';
import { atomicWriteFileSync, ensureDirSync } from './lib/atomic-write.mjs';

const SEED_DIR = '.seed';
const MEMORY_FILE = 'project-memory.json';
const TRACKED_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);

function emptyMemory() {
  return {
    techStack: { languages: [], engine: '', buildTool: '', testTool: '' },
    hotPaths: [],
    userDirectives: [],
    customNotes: [],
    lastScanned: null
  };
}

function loadMemory(memoryPath) {
  if (!existsSync(memoryPath)) return emptyMemory();
  try {
    return JSON.parse(readFileSync(memoryPath, 'utf-8'));
  } catch {
    return emptyMemory();
  }
}

function updateHotPaths(memory, filePath, cwd) {
  let relPath = filePath;
  if (isAbsolute(filePath)) {
    relPath = relative(cwd, filePath);
  }

  const existing = memory.hotPaths.find(hp => hp.path === relPath);
  if (existing) {
    existing.count = (existing.count || 0) + 1;
    existing.lastAccess = new Date().toISOString();
  } else {
    memory.hotPaths.push({
      path: relPath,
      count: 1,
      lastAccess: new Date().toISOString()
    });
  }

  // Keep only top 50 by count
  memory.hotPaths.sort((a, b) => (b.count || 0) - (a.count || 0));
  if (memory.hotPaths.length > 50) {
    memory.hotPaths = memory.hotPaths.slice(0, 50);
  }
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolName = data.tool_name || data.toolName || '';
    if (!TRACKED_TOOLS.has(toolName)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const cwd = data.cwd || data.directory || process.cwd();
    const seedDir = join(cwd, SEED_DIR);
    const memoryPath = join(seedDir, MEMORY_FILE);

    ensureDirSync(seedDir);
    const memory = loadMemory(memoryPath);

    // Extract file path from tool input
    const toolInput = data.tool_input || data.toolInput || {};
    const filePath = toolInput.file_path || toolInput.filePath || toolInput.path || '';

    if (filePath) {
      updateHotPaths(memory, filePath, cwd);
      atomicWriteFileSync(memoryPath, JSON.stringify(memory, null, 2));
    }

    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
