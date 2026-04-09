#!/usr/bin/env node
/**
 * Skill 注入器 Hook（UserPromptSubmit）
 *
 * 扫描用户 prompt 中的触发关键词，并将匹配的
 * learned skill 片段注入到上下文中。
 *
 * 扫描顺序（优先级从高到低）：
 *   1. {cwd}/.seed/skills/（项目级）
 *   2. $CLAUDE_PLUGIN_ROOT/skills/（插件内置）
 *
 * Session 级别的去重状态持久化到 .seed/state/skill-injected-{sessionId}.json，
 * 以确保在同一 session 的多次 hook 调用间不重复注入。
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
  } catch { /* 忽略 */ }
  return new Set();
}

function saveInjectedSet(cwd, sessionId, set) {
  if (!isValidSessionId(sessionId)) return;
  const filePath = getInjectedFilePath(cwd, sessionId);
  try {
    ensureDirSync(join(cwd, SEED_DIR, 'state'));
    atomicWriteFileSync(filePath, JSON.stringify([...set]));
  } catch { /* 忽略 — 去重是尽力而为 */ }
}

/**
 * 解析 skill 文件的 YAML frontmatter。
 * 返回 { name, triggers, scope, domain, content } 或 null。
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

  const scope = [];
  const scopeMatch = yamlContent.match(/scope:\s*\n((?:\s+-\s*.+\n?)*)/);
  if (scopeMatch) {
    const lines = scopeMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.match(/^\s+-\s*["']?([^"'\n]+)["']?\s*$/);
      if (itemMatch) scope.push(itemMatch[1].trim().toLowerCase());
    }
  }
  if (scope.length === 0) {
    scope.push('user-chat', 'agent-inject');
  }

  const domain = [];
  const domainMatch = yamlContent.match(/domain:\s*\n((?:\s+-\s*.+\n?)*)/);
  if (domainMatch) {
    const lines = domainMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.match(/^\s+-\s*["']?([^"'\n]+)["']?\s*$/);
      if (itemMatch) domain.push(itemMatch[1].trim().toLowerCase());
    }
  }

  const nameMatch = yamlContent.match(/name:\s*["']?([^"'\n]+)["']?/);
  const name = nameMatch ? nameMatch[1].trim() : '未命名 Skill';

  return { name, triggers, scope, domain, content: body };
}

/**
 * 递归扫描目录，收集所有 .md skill 文件。
 */
function scanDir(dir, scope, candidates, seenPaths) {
  if (!existsSync(dir)) return;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, scope, candidates, seenPaths);
      } else if (entry.isFile() && entry.name.endsWith(SKILL_EXTENSION)) {
        try {
          const realPath = realpathSync(fullPath);
          if (!seenPaths.has(realPath)) {
            seenPaths.add(realPath);
            candidates.push({ path: fullPath, scope });
          }
        } catch { /* 忽略符号链接错误 */ }
      }
    }
  } catch { /* 忽略目录读取错误 */ }
}

/**
 * 从指定目录中递归发现所有 .md skill 文件。
 * 支持 domain/、method/、tooling/ 等任意深度子目录。
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
    scanDir(dir, scope, candidates, seenPaths);
  }

  return candidates;
}

/**
 * 将 prompt 与 skill 触发词匹配，返回得分最高的结果。
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

      if (!skill.scope.includes('user-chat')) continue;

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
          triggers: skill.triggers,
          domain: skill.domain
        });
      }
    } catch { /* 忽略文件读取错误 */ }
  }

  matches.sort((a, b) => b.score - a.score);

  // 强制 session 级别限制：仅选取不超过（上限 - 已注入数量）个
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
 * 格式化匹配的 skill 用于注入。
 */
function formatSkillsMessage(skills) {
  const lines = [
    '<seed-skills>',
    '',
    '## 相关 Learned Skills',
    '',
    '以下 skill 可能对当前任务有帮助：',
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
    try { data = JSON.parse(input); } catch { /* 忽略 */ }

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
