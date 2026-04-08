#!/usr/bin/env node
/**
 * Skill Injector Hook (UserPromptSubmit)
 *
 * Scans the user prompt for trigger keywords and injects matching
 * learned skill fragments into the context.
 *
 * Scan order (higher priority first):
 *   1. {cwd}/.seed/skills/  (project-level)
 *   2. $CLAUDE_PLUGIN_ROOT/skills/  (plugin built-in)
 *
 * Session-level dedup is persisted to .seed/state/skill-injected-{sessionId}.json
 * so it survives across hook invocations within the same session.
 */

import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { readStdin } from './lib/stdin.mjs';
import { atomicWriteFileSync, ensureDirSync } from './lib/atomic-write.mjs';

const SEED_DIR = '.seed';
const SKILL_EXTENSION = '.md';
const MAX_SKILLS_PER_SESSION = 5;
const SESSION_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,255}$/;

function isValidSessionId(sessionId) {
  return sessionId && sessionId !== 'unknown' && SESSION_ID_PATTERN.test(sessionId);
}

function getInjectedFilePath(cwd, sessionId) {
  return join(cwd, SEED_DIR, 'state', `skill-injected-${sessionId}.json`);
}

function loadInjectedSet(cwd, sessionId) {
  if (!isValidSessionId(sessionId)) return new Set();
  const filePath = getInjectedFilePath(cwd, sessionId);
  try {
    if (existsSync(filePath)) {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      return new Set(Array.isArray(data) ? data : []);
    }
  } catch { /* ignore */ }
  return new Set();
}

function saveInjectedSet(cwd, sessionId, set) {
  if (!isValidSessionId(sessionId)) return;
  const filePath = getInjectedFilePath(cwd, sessionId);
  try {
    ensureDirSync(join(cwd, SEED_DIR, 'state'));
    atomicWriteFileSync(filePath, JSON.stringify([...set]));
  } catch { /* ignore — dedup is best-effort */ }
}

/**
 * Parse YAML frontmatter from a skill file.
 * Returns { name, triggers, content } or null.
 */
function parseSkillFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  const yamlContent = match[1];
  const body = match[2].trim();

  const triggers = [];
  const triggerMatch = yamlContent.match(/triggers:\s*\n((?:\s+-\s*.+\n?)*)/);
  if (triggerMatch) {
    const lines = triggerMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.match(/^\s+-\s*["']?([^"'\n]+)["']?\s*$/);
      if (itemMatch) triggers.push(itemMatch[1].trim().toLowerCase());
    }
  }

  const nameMatch = yamlContent.match(/name:\s*["']?([^"'\n]+)["']?/);
  const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Skill';

  return { name, triggers, content: body };
}

/**
 * Discover all .md skill files from the given directories.
 */
function findSkillFiles(cwd) {
  const candidates = [];
  const seenPaths = new Set();
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';

  const scanDirs = [
    { dir: join(cwd, SEED_DIR, 'skills'), scope: 'project' },
    ...(pluginRoot ? [{ dir: join(pluginRoot, 'skills'), scope: 'builtin' }] : []),
  ];

  for (const { dir, scope } of scanDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith(SKILL_EXTENSION)) continue;
        const fullPath = join(dir, file.name);
        try {
          const realPath = realpathSync(fullPath);
          if (!seenPaths.has(realPath)) {
            seenPaths.add(realPath);
            candidates.push({ path: fullPath, scope });
          }
        } catch { /* ignore symlink errors */ }
      }
    } catch { /* ignore directory read errors */ }
  }

  return candidates;
}

/**
 * Match prompt against skill triggers, return top results.
 */
function findMatchingSkills(prompt, cwd, sessionId) {
  const promptLower = prompt.toLowerCase();
  const candidates = findSkillFiles(cwd);
  const matches = [];

  const alreadyInjected = loadInjectedSet(cwd, sessionId);

  for (const candidate of candidates) {
    if (alreadyInjected.has(candidate.path)) continue;

    try {
      const content = readFileSync(candidate.path, 'utf-8');
      const skill = parseSkillFrontmatter(content);
      if (!skill) continue;

      let score = 0;
      for (const trigger of skill.triggers) {
        if (promptLower.includes(trigger)) {
          score += 10;
        }
      }

      if (score > 0) {
        matches.push({
          path: candidate.path,
          name: skill.name,
          content: skill.content,
          score,
          scope: candidate.scope,
          triggers: skill.triggers
        });
      }
    } catch { /* ignore file read errors */ }
  }

  matches.sort((a, b) => b.score - a.score);

  // Enforce session-wide limit: only select up to (MAX - already injected count)
  const remaining = Math.max(0, MAX_SKILLS_PER_SESSION - alreadyInjected.size);
  const selected = matches.slice(0, remaining);

  if (selected.length > 0) {
    for (const skill of selected) {
      alreadyInjected.add(skill.path);
    }
    saveInjectedSet(cwd, sessionId, alreadyInjected);
  }

  return selected;
}

/**
 * Format matched skills for injection.
 */
function formatSkillsMessage(skills) {
  const lines = [
    '<seed-skills>',
    '',
    '## Relevant Learned Skills',
    '',
    'The following skills may help with this task:',
    ''
  ];

  for (const skill of skills) {
    lines.push(`### ${skill.name} (${skill.scope})`);
    lines.push('');
    lines.push(skill.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('</seed-skills>');
  return lines.join('\n');
}

async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    let data = {};
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const prompt = data.prompt || '';
    const sessionId = data.session_id || data.sessionId || 'unknown';
    const cwd = data.cwd || process.cwd();

    if (!prompt) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const matchingSkills = findMatchingSkills(prompt, cwd, sessionId);

    if (matchingSkills.length > 0) {
      console.log(JSON.stringify({
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: formatSkillsMessage(matchingSkills)
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    }
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
