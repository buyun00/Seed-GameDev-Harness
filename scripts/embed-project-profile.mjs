#!/usr/bin/env node
/**
 * Build the simplified /seed:embed project profile.
 *
 * This script scans a game project once, records the engine/language/directory
 * shape, and writes Seed's long-term project memory.
 */

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { join, relative, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { atomicWriteFileSync, ensureDirSync } from './lib/atomic-write.mjs';

const SEED_DIR = '.seed';
const MEMORY_FILE = 'project-memory.json';
const PROFILE_FILE = 'project-profile.md';
const DEFAULT_MAX_DIRECTORY_ENTRIES = 80;
const MAX_TEXT_READ_BYTES = 1024 * 1024;

const LANGUAGE_EXTENSIONS = new Map([
  ['.cs', { id: 'cs', display: 'C#' }],
  ['.lua', { id: 'lua', display: 'Lua' }],
  ['.gd', { id: 'gd', display: 'GDScript' }],
  ['.ts', { id: 'ts', display: 'TypeScript' }],
  ['.js', { id: 'js', display: 'JavaScript' }],
  ['.cpp', { id: 'cpp', display: 'C++' }],
  ['.h', { id: 'cpp', display: 'C++' }],
  ['.hpp', { id: 'cpp', display: 'C++' }],
  ['.py', { id: 'py', display: 'Python' }],
]);

const LANGUAGE_DISPLAY = {
  cs: 'C#',
  lua: 'Lua',
  gd: 'GDScript',
  ts: 'TypeScript',
  js: 'JavaScript',
  cpp: 'C++',
  py: 'Python',
};

const IGNORED_DIR_NAMES = new Set([
  '.git',
  '.seed',
  '.claude',
  '.claude-plugin',
  'Library',
  'Temp',
  'Logs',
  'Obj',
  'node_modules',
  'DerivedDataCache',
]);

function parseArgs(argv) {
  const args = { cwd: process.cwd(), check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--cwd') {
      args.cwd = argv[i + 1] || args.cwd;
      i += 1;
    } else if (arg === '--check') {
      args.check = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }
  args.cwd = resolve(args.cwd);
  return args;
}

function readJsonSafe(filePath, fallback = null) {
  try {
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function readTextSafe(filePath, maxBytes = MAX_TEXT_READ_BYTES) {
  try {
    const stats = statSync(filePath);
    if (stats.size > maxBytes) return '';
    return readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function shouldSkipDir(relPath, name) {
  if (IGNORED_DIR_NAMES.has(name)) return true;
  const normalized = relPath.replace(/\\/g, '/');
  if (normalized === SEED_DIR || normalized.startsWith(`${SEED_DIR}/`)) return true;
  return false;
}

function walkFiles(cwd) {
  const files = [];

  function walk(dir) {
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(cwd, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (!shouldSkipDir(relPath, entry.name)) walk(fullPath);
      } else if (entry.isFile()) {
        files.push({ fullPath, relPath });
      }
    }
  }

  walk(cwd);
  return files;
}

function detectUnity(cwd) {
  const projectVersionPath = join(cwd, 'ProjectSettings', 'ProjectVersion.txt');
  if (!existsSync(projectVersionPath)) return null;
  const content = readTextSafe(projectVersionPath);
  const match = content.match(/m_EditorVersion:\s*([^\r\n]+)/);
  return {
    name: 'unity',
    displayName: 'Unity',
    version: match ? match[1].trim() : '',
    evidence: ['ProjectSettings/ProjectVersion.txt'],
  };
}

function detectGodot(cwd) {
  const projectPath = join(cwd, 'project.godot');
  if (!existsSync(projectPath)) return null;
  const content = readTextSafe(projectPath);
  const match = content.match(/config_version\s*=\s*([^\r\n]+)/);
  return {
    name: 'godot',
    displayName: 'Godot',
    version: match ? `config_version ${match[1].trim()}` : '',
    evidence: ['project.godot'],
  };
}

function detectUnreal(cwd) {
  let files = [];
  try {
    files = readdirSync(cwd, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.uproject'))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  const rel = files[0];
  const data = readJsonSafe(join(cwd, rel), {});
  return {
    name: 'unreal',
    displayName: 'Unreal',
    version: data?.EngineAssociation ? String(data.EngineAssociation) : '',
    evidence: [rel],
  };
}

function detectCocos(cwd) {
  const packagePath = join(cwd, 'package.json');
  const pkg = readJsonSafe(packagePath, null);
  if (!pkg) return null;
  const text = JSON.stringify(pkg).toLowerCase();
  if (!text.includes('cocos') && !text.includes('creator')) return null;
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const cocosDep = Object.entries(deps).find(([name]) => /cocos|creator/i.test(name));
  return {
    name: 'cocos',
    displayName: 'Cocos',
    version: cocosDep ? `${cocosDep[0]} ${cocosDep[1]}` : '',
    evidence: ['package.json'],
  };
}

function detectEngine(cwd) {
  return detectUnity(cwd)
    || detectGodot(cwd)
    || detectUnreal(cwd)
    || detectCocos(cwd)
    || { name: 'none', displayName: 'Unknown', version: '', evidence: [] };
}

function countLanguages(files) {
  const counts = {};
  for (const file of files) {
    const lower = file.relPath.toLowerCase();
    const ext = lower.match(/(\.[^.\/]+)$/)?.[1] || '';
    const language = LANGUAGE_EXTENSIONS.get(ext);
    if (!language) continue;
    counts[language.id] = (counts[language.id] || 0) + 1;
  }
  return counts;
}

function collectSignals(files) {
  const signals = {
    luaBridge: new Set(),
    blueprint: new Set(),
    addressables: new Set(),
    build: new Set(),
  };
  const signalPattern = /LuaEnv|XLua|ToLua|tolua|LuaInterface|SLua|CSharpCallLua|LuaCallCSharp|Addressables|BuildPipeline|Jenkinsfile|github\/workflows|BlueprintCallable|UBlueprint|\.uasset/;

  for (const file of files) {
    const rel = file.relPath.replace(/\\/g, '/');
    const lower = rel.toLowerCase();
    if (lower.includes('.github/workflows') || basename(rel) === 'Jenkinsfile') {
      signals.build.add(rel);
    }
    if (lower.endsWith('.uasset') && lower.includes('blueprint')) {
      signals.blueprint.add(rel);
    }
    if (!/\.(cs|lua|ts|js|gd|json|asmdef|uproject)$/i.test(rel)) continue;
    const text = readTextSafe(file.fullPath);
    if (!text || !signalPattern.test(text)) continue;
    if (/LuaEnv|XLua|ToLua|tolua|LuaInterface|SLua|CSharpCallLua|LuaCallCSharp/.test(text)) {
      signals.luaBridge.add(rel);
    }
    if (/Addressables/.test(text) || lower.includes('addressableassetsdata')) {
      signals.addressables.add(rel);
    }
    if (/BlueprintCallable|UBlueprint/.test(text)) {
      signals.blueprint.add(rel);
    }
  }

  return {
    luaBridge: [...signals.luaBridge].slice(0, 8),
    blueprint: [...signals.blueprint].slice(0, 8),
    addressables: [...signals.addressables].slice(0, 8),
    build: [...signals.build].slice(0, 8),
  };
}

function sortedLanguageIds(counts) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}

function role(language, roleId, summary) {
  return { language, role: roleId, summary };
}

function inferLanguageRoles(engine, counts, signals) {
  const ids = sortedLanguageIds(counts);
  const roles = [];
  const hasLua = (counts.lua || 0) > 0;
  const hasCs = (counts.cs || 0) > 0;
  const hasTs = (counts.ts || 0) > 0;
  const hasJs = (counts.js || 0) > 0;
  const hasGd = (counts.gd || 0) > 0;
  const hasCpp = (counts.cpp || 0) > 0;
  const hasLuaBridge = signals.luaBridge.length > 0;

  if (engine.name === 'unity') {
    if (hasLua && hasLuaBridge) {
      roles.push(role('Lua', 'gameplay_primary', 'Lua appears to be the primary gameplay/business scripting layer.'));
      if (hasCs) roles.push(role('C#', 'engine_host_bridge_tooling', 'C# appears to provide the Unity host layer, Lua bridge, editor/build tooling, and framework glue.'));
    } else if (hasCs) {
      roles.push(role('C#', 'gameplay_runtime_primary', 'C# appears to be the main Unity gameplay/runtime language.'));
      if (hasLua) roles.push(role('Lua', 'secondary_or_unconfirmed', 'Lua files exist, but no known Lua bridge entry was found.'));
    }
  } else if (engine.name === 'cocos') {
    if (hasTs) roles.push(role('TypeScript', 'gameplay_runtime_primary', 'TypeScript appears to be the main Cocos gameplay/runtime language.'));
    if (hasJs) roles.push(role('JavaScript', hasTs ? 'secondary_runtime' : 'gameplay_runtime_primary', hasTs ? 'JavaScript appears to supplement the TypeScript runtime.' : 'JavaScript appears to be the main Cocos gameplay/runtime language.'));
  } else if (engine.name === 'godot') {
    if (hasGd || hasCs) {
      const gdCount = counts.gd || 0;
      const csCount = counts.cs || 0;
      if (gdCount >= csCount && hasGd) roles.push(role('GDScript', 'gameplay_runtime_primary', 'GDScript appears to be the main Godot scripting layer.'));
      if (csCount > gdCount && hasCs) roles.push(role('C#', 'gameplay_runtime_primary', 'C# appears to be the main Godot runtime language.'));
      if (hasGd && csCount > gdCount) roles.push(role('GDScript', 'secondary_runtime', 'GDScript is present as a secondary Godot scripting layer.'));
      if (hasCs && gdCount >= csCount) roles.push(role('C#', 'secondary_runtime', 'C# is present as a secondary Godot runtime layer.'));
    }
  } else if (engine.name === 'unreal') {
    if (hasCpp) roles.push(role('C++', 'native_runtime_primary', 'C++ appears to be the Unreal native runtime layer.'));
    if (signals.blueprint.length) roles.push(role('Blueprint', 'visual_scripting_assets', 'Blueprint evidence was found in Unreal assets or C++ exposure points.'));
  }

  for (const id of ids) {
    const display = LANGUAGE_DISPLAY[id] || id;
    if (!roles.some((item) => item.language === display)) {
      roles.push(role(display, 'supporting_or_unclassified', `${display} files are present; no stronger project role was inferred.`));
    }
  }

  let primary = ids[0] || '';
  if (engine.name === 'unity' && hasLua && hasLuaBridge) primary = 'lua';
  if (engine.name === 'cocos' && hasTs) primary = 'ts';
  if (engine.name === 'cocos' && !hasTs && hasJs) primary = 'js';
  if (engine.name === 'godot' && (hasGd || hasCs)) primary = (counts.gd || 0) >= (counts.cs || 0) ? 'gd' : 'cs';
  if (engine.name === 'unreal' && hasCpp) primary = 'cpp';

  return {
    primary,
    secondary: ids.filter((id) => id !== primary),
    roles,
  };
}

function countFilesUnder(files, relDir) {
  const prefix = relDir ? `${relDir.replace(/\\/g, '/').replace(/\/$/, '')}/` : '';
  const counts = {};
  let total = 0;
  for (const file of files) {
    if (prefix && !file.relPath.startsWith(prefix)) continue;
    total += 1;
    const ext = file.relPath.toLowerCase().match(/(\.[^.\/]+)$/)?.[1] || '';
    counts[ext] = (counts[ext] || 0) + 1;
  }
  return { total, counts };
}

function evidenceForDir(files, relDir) {
  const stats = countFilesUnder(files, relDir);
  const evidence = [`directory exists`];
  const interesting = Object.entries(stats.counts)
    .filter(([ext]) => ['.cs', '.lua', '.gd', '.ts', '.js', '.cpp', '.h', '.hpp', '.unity', '.tscn', '.uproject', '.prefab', '.scene', '.json', '.asmdef'].includes(ext))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  for (const [ext, count] of interesting) {
    evidence.push(`${count} ${ext} file${count === 1 ? '' : 's'}`);
  }
  return evidence;
}

function classifyDirectory(relPath, engine) {
  const lower = relPath.toLowerCase();
  const name = basename(relPath).toLowerCase();
  const high = (purpose) => ({ purpose, confidence: 'high' });
  const medium = (purpose) => ({ purpose, confidence: 'medium' });
  const low = (purpose) => ({ purpose, confidence: 'low' });

  if (engine.name === 'unity') {
    if (relPath === 'Assets') return high('Unity asset and gameplay root');
    if (relPath === 'Packages') return high('Unity package dependency configuration');
    if (relPath === 'ProjectSettings') return high('Unity project settings');
    if (lower === 'assets/lua' || lower.includes('/lua')) return high('Lua gameplay/business scripts');
    if (lower === 'assets/scripts' || lower.includes('/scripts')) return high('Unity C# host/framework scripts');
    if (lower.includes('/editor') || name === 'editor') return high('Unity editor tooling');
    if (lower.includes('/plugins') || name === 'plugins') return high('Unity native or third-party plugins');
    if (lower.includes('addressable') || lower.includes('assetbundle')) return high('Unity asset loading/build pipeline');
    if (lower.includes('/resources') || name === 'resources') return medium('Unity Resources assets');
    if (lower.includes('/scenes') || name === 'scenes') return medium('Unity scenes');
    if (lower.includes('/prefabs') || name === 'prefabs') return medium('Unity prefabs');
  }

  if (engine.name === 'cocos') {
    if (relPath === 'assets') return high('Cocos asset and script root');
    if (relPath === 'settings') return high('Cocos project settings');
    if (relPath === 'extensions') return high('Cocos editor/native extensions');
    if (lower.includes('bundle')) return high('Cocos bundle/resource pipeline');
    if (lower.includes('/scripts') || lower.includes('/script')) return high('Cocos gameplay scripts');
  }

  if (engine.name === 'godot') {
    if (relPath === 'addons') return high('Godot addons/plugins');
    if (lower.includes('scene')) return medium('Godot scenes');
    if (lower.includes('script')) return medium('Godot scripts');
  }

  if (engine.name === 'unreal') {
    if (relPath === 'Source') return high('Unreal C++ source modules');
    if (relPath === 'Content') return high('Unreal assets and Blueprint content');
    if (relPath === 'Config') return high('Unreal project configuration');
    if (relPath === 'Plugins') return high('Unreal plugins');
  }

  if (lower.includes('config') || lower.includes('settings')) return medium('Project configuration');
  if (lower.includes('build') || lower.includes('release') || lower.includes('ci')) return medium('Build/release tooling');
  if (lower.includes('tool') || lower.includes('editor')) return medium('Project tooling');
  if (lower.includes('doc') || lower.includes('design') || lower.includes('文档') || lower.includes('策划')) return medium('Project documentation/design notes');
  if (lower.includes('asset') || lower.includes('res')) return low('Project assets/resources');
  if (lower.includes('test')) return low('Tests or validation assets');
  return low('Project directory');
}

function listDirs(cwd, relDir = '') {
  const dir = relDir ? join(cwd, relDir) : cwd;
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
        return rel.replace(/\\/g, '/');
      })
      .filter((rel) => !shouldSkipDir(rel, basename(rel)))
      .sort();
  } catch {
    return [];
  }
}

function collectDirectoryCandidates(cwd, engine) {
  const candidates = new Set(listDirs(cwd));

  const addChildren = (relDir) => {
    if (existsSync(join(cwd, relDir))) {
      candidates.add(relDir);
      for (const child of listDirs(cwd, relDir)) candidates.add(child);
    }
  };

  if (engine.name === 'unity') {
    addChildren('Assets');
    addChildren('Packages');
    addChildren('ProjectSettings');
  } else if (engine.name === 'cocos') {
    addChildren('assets');
    addChildren('settings');
    addChildren('extensions');
  } else if (engine.name === 'godot') {
    addChildren('addons');
    for (const dir of listDirs(cwd)) {
      if (/scene|script|src|source/i.test(dir)) addChildren(dir);
    }
  } else if (engine.name === 'unreal') {
    addChildren('Source');
    addChildren('Content');
    addChildren('Config');
    addChildren('Plugins');
  }

  return [...candidates].filter((rel) => existsSync(join(cwd, rel)));
}

function directoryPriority(entry) {
  const lower = entry.path.toLowerCase();
  let score = 0;
  if (entry.confidence === 'high') score += 100;
  if (entry.confidence === 'medium') score += 50;
  if (/assets|source|content|projectsettings|packages|scripts|lua|settings|config|plugins|addons/.test(lower)) score += 40;
  if (/build|release|tool|editor|resource|scene|prefab|bundle/.test(lower)) score += 20;
  score -= entry.path.split('/').length;
  return score;
}

function analyzeDirectories(cwd, engine, files, maxEntries) {
  const candidates = collectDirectoryCandidates(cwd, engine);
  const entries = candidates.map((path) => {
    const classification = classifyDirectory(path, engine);
    return {
      path,
      purpose: classification.purpose,
      evidence: evidenceForDir(files, path),
      confidence: classification.confidence,
    };
  });

  entries.sort((a, b) => directoryPriority(b) - directoryPriority(a) || a.path.localeCompare(b.path));
  return entries.slice(0, maxEntries);
}

function formatEngine(engine) {
  if (!engine || engine.name === 'none') return 'Unknown';
  return engine.version ? `${engine.displayName} ${engine.version}` : engine.displayName;
}

function buildProfile(cwd, options = {}) {
  const files = walkFiles(cwd);
  const engine = detectEngine(cwd);
  const fileCounts = countLanguages(files);
  const signals = collectSignals(files);
  const languageRoles = inferLanguageRoles(engine, fileCounts, signals);
  const maxDirectoryEntries = options.maxDirectoryEntries || DEFAULT_MAX_DIRECTORY_ENTRIES;
  const directories = analyzeDirectories(cwd, engine, files, maxDirectoryEntries);
  const now = options.now || new Date().toISOString();

  return {
    schemaVersion: 1,
    generatedAt: now,
    engine: {
      name: engine.name,
      version: engine.version,
      evidence: engine.evidence,
    },
    languages: {
      fileCounts,
      primary: languageRoles.primary,
      secondary: languageRoles.secondary,
      roles: languageRoles.roles,
    },
    directories,
    notes: buildNotes(engine, fileCounts, signals),
  };
}

function buildNotes(engine, fileCounts, signals) {
  const notes = [];
  if (engine.name === 'none') {
    notes.push('No supported game engine marker was found.');
  }
  if (signals.luaBridge.length) {
    notes.push(`Lua bridge evidence: ${signals.luaBridge.slice(0, 3).join(', ')}`);
  }
  if (signals.blueprint.length) {
    notes.push(`Blueprint evidence: ${signals.blueprint.slice(0, 3).join(', ')}`);
  }
  if (Object.keys(fileCounts).length === 0) {
    notes.push('No tracked source language files were found.');
  }
  return notes;
}

function emptyMemory() {
  return {
    techStack: { languages: [], engine: '', buildTool: '', testTool: '' },
    hotPaths: [],
    userDirectives: [],
    customNotes: [],
    projectProfile: null,
    lastScanned: null,
  };
}

function loadMemory(memoryPath) {
  const existing = readJsonSafe(memoryPath, null);
  if (!existing || typeof existing !== 'object') return emptyMemory();
  const base = emptyMemory();
  return {
    ...base,
    ...existing,
    techStack: { ...base.techStack, ...(existing.techStack || {}) },
    hotPaths: Array.isArray(existing.hotPaths) ? existing.hotPaths : [],
    userDirectives: Array.isArray(existing.userDirectives) ? existing.userDirectives : [],
    customNotes: Array.isArray(existing.customNotes) ? existing.customNotes : [],
  };
}

function buildMemory(existingMemory, profile) {
  const languageIds = sortedLanguageIds(profile.languages.fileCounts || {});
  const languages = languageIds.map((id) => LANGUAGE_DISPLAY[id] || id);
  return {
    ...existingMemory,
    techStack: {
      ...(existingMemory.techStack || {}),
      engine: formatEngine({
        name: profile.engine.name,
        displayName: engineDisplayName(profile.engine.name),
        version: profile.engine.version,
      }),
      languages,
    },
    projectProfile: profile,
    lastScanned: profile.generatedAt,
  };
}

function engineDisplayName(name) {
  return {
    unity: 'Unity',
    godot: 'Godot',
    unreal: 'Unreal',
    cocos: 'Cocos',
    none: 'Unknown',
  }[name] || name;
}

function readLanguageConfig(cwd) {
  const config = readJsonSafe(join(cwd, SEED_DIR, 'config.json'), {});
  return config?.language || '';
}

function markdownLabels(lang) {
  const value = lang || '';
  if (/中文|chinese|zh/i.test(value)) {
    return {
      notice: '> 此文件由 `/seed:embed` 生成。你可以人工阅读或临时修改；下次运行 `/seed:embed` 会重新生成并覆盖。',
      overview: '## 概览',
      engine: '引擎',
      primaryLanguage: '主语言',
      generatedAt: '生成时间',
      languageDistribution: '## 语言分布',
      language: '语言',
      files: '文件数',
      role: '作用',
      notes: '说明',
      directoryMap: '## 目录地图',
      path: '路径',
      purpose: '用途',
      evidence: '证据',
      confidence: '置信度',
      notesHeading: '## 备注',
      none: '- 暂无。',
    };
  }
  if (/日本|japanese|ja/i.test(value)) {
    return {
      notice: '> このファイルは `/seed:embed` により生成されます。確認や一時編集はできますが、次回の `/seed:embed` 実行時に再生成され上書きされます。',
      overview: '## 概要',
      engine: 'エンジン',
      primaryLanguage: '主要言語',
      generatedAt: '生成日時',
      languageDistribution: '## 言語分布',
      language: '言語',
      files: 'ファイル数',
      role: '役割',
      notes: 'メモ',
      directoryMap: '## ディレクトリマップ',
      path: 'パス',
      purpose: '用途',
      evidence: '根拠',
      confidence: '信頼度',
      notesHeading: '## メモ',
      none: '- なし。',
    };
  }
  if (/한국|korean|ko/i.test(value)) {
    return {
      notice: '> 이 파일은 `/seed:embed`가 생성합니다. 검토하거나 임시로 수정할 수 있지만, 다음 `/seed:embed` 실행 시 다시 생성되어 덮어씁니다.',
      overview: '## 개요',
      engine: '엔진',
      primaryLanguage: '주요 언어',
      generatedAt: '생성 시각',
      languageDistribution: '## 언어 분포',
      language: '언어',
      files: '파일 수',
      role: '역할',
      notes: '메모',
      directoryMap: '## 디렉터리 맵',
      path: '경로',
      purpose: '용도',
      evidence: '근거',
      confidence: '신뢰도',
      notesHeading: '## 메모',
      none: '- 없음.',
    };
  }
  return {
    notice: '> Generated by `/seed:embed`. You may read or temporarily edit this file; the next `/seed:embed` run will regenerate and overwrite it.',
    overview: '## Overview',
    engine: 'Engine',
    primaryLanguage: 'Primary language',
    generatedAt: 'Generated at',
    languageDistribution: '## Language Distribution',
    language: 'Language',
    files: 'Files',
    role: 'Role',
    notes: 'Notes',
    directoryMap: '## Directory Map',
    path: 'Path',
    purpose: 'Purpose',
    evidence: 'Evidence',
    confidence: 'Confidence',
    notesHeading: '## Notes',
    none: '- None.',
  };
}

function escapeTable(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function roleSummaryByLanguage(profile, language) {
  const item = profile.languages.roles.find((roleItem) => roleItem.language === language);
  return item ? item.summary : '';
}

function renderMarkdownProfile(profile, lang = '') {
  const labels = markdownLabels(lang);
  const title = '# Seed Project Profile';
  const lines = [
    title,
    '',
    labels.notice,
    '',
    labels.overview,
    `- ${labels.engine}: ${escapeTable(formatEngine({ name: profile.engine.name, displayName: engineDisplayName(profile.engine.name), version: profile.engine.version }))}`,
    `- ${labels.primaryLanguage}: ${escapeTable(LANGUAGE_DISPLAY[profile.languages.primary] || profile.languages.primary || 'unknown')}`,
    `- ${labels.generatedAt}: ${profile.generatedAt}`,
    '',
    labels.languageDistribution,
    `| ${labels.language} | ${labels.files} | ${labels.role} | ${labels.notes} |`,
    '|---|---:|---|---|',
  ];

  for (const id of sortedLanguageIds(profile.languages.fileCounts || {})) {
    const display = LANGUAGE_DISPLAY[id] || id;
    const roleItem = profile.languages.roles.find((item) => item.language === display);
    lines.push(`| ${escapeTable(display)} | ${profile.languages.fileCounts[id] || 0} | ${escapeTable(roleItem?.role || '')} | ${escapeTable(roleItem?.summary || roleSummaryByLanguage(profile, display))} |`);
  }

  lines.push('', labels.directoryMap);
  lines.push(`| ${labels.path} | ${labels.purpose} | ${labels.evidence} | ${labels.confidence} |`);
  lines.push('|---|---|---|---|');
  for (const dir of profile.directories) {
    lines.push(`| ${escapeTable(dir.path)} | ${escapeTable(dir.purpose)} | ${escapeTable((dir.evidence || []).join('; '))} | ${escapeTable(dir.confidence)} |`);
  }

  lines.push('', labels.notesHeading);
  if (profile.notes?.length) {
    for (const note of profile.notes) lines.push(`- ${note}`);
  } else {
    lines.push(labels.none);
  }

  return `${lines.join('\n')}\n`;
}

function loadEmbedConfig(cwd) {
  const config = readJsonSafe(join(cwd, SEED_DIR, 'config.json'), {});
  const embed = config?.embed || {};
  return {
    maxDirectoryEntries: Number.isFinite(Number(embed.maxDirectoryEntries))
      ? Math.max(1, Number(embed.maxDirectoryEntries))
      : DEFAULT_MAX_DIRECTORY_ENTRIES,
    writeMarkdownProfile: embed.writeMarkdownProfile !== false,
  };
}

function summarize(profile, written, memoryPath, markdownPath) {
  return {
    ok: true,
    written,
    engine: {
      name: profile.engine.name,
      version: profile.engine.version,
      display: formatEngine({ name: profile.engine.name, displayName: engineDisplayName(profile.engine.name), version: profile.engine.version }),
    },
    languages: {
      fileCounts: profile.languages.fileCounts,
      primary: profile.languages.primary,
      secondary: profile.languages.secondary,
      roles: profile.languages.roles,
    },
    directories: profile.directories.slice(0, 12),
    files: {
      memory: memoryPath,
      markdown: markdownPath,
    },
    notes: profile.notes,
  };
}

export function runEmbedProjectProfile({ cwd = process.cwd(), check = false, now } = {}) {
  const root = resolve(cwd);
  const config = loadEmbedConfig(root);
  const profile = buildProfile(root, { maxDirectoryEntries: config.maxDirectoryEntries, now });
  const seedDir = join(root, SEED_DIR);
  const memoryPath = join(seedDir, MEMORY_FILE);
  const markdownPath = join(seedDir, PROFILE_FILE);

  if (!check) {
    ensureDirSync(seedDir);
    const memory = buildMemory(loadMemory(memoryPath), profile);
    atomicWriteFileSync(memoryPath, `${JSON.stringify(memory, null, 2)}\n`);
    if (config.writeMarkdownProfile) {
      atomicWriteFileSync(markdownPath, renderMarkdownProfile(profile, readLanguageConfig(root)));
    }
  }

  return summarize(profile, !check, memoryPath, markdownPath);
}

function printHelp() {
  console.log(`Usage: node scripts/embed-project-profile.mjs [--cwd <projectRoot>] [--check]\n\nScans a project and writes .seed/project-memory.json plus .seed/project-profile.md unless --check is set.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  const result = runEmbedProjectProfile({ cwd: args.cwd, check: args.check });
  console.log(JSON.stringify(result, null, 2));
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });
}

// Tiny fixture helper used by tests without exporting fs internals elsewhere.
export function withTempProject(callback) {
  const dir = mkdtempSync(join(tmpdir(), 'seed-embed-profile-'));
  try {
    return callback(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
