/**
 * Shared formatter for Seed project memory injection.
 */

import { t } from './i18n.mjs';

const ENGINE_NAMES = {
  unity: 'Unity',
  godot: 'Godot',
  unreal: 'Unreal',
  cocos: 'Cocos',
  none: 'Unknown',
};

const ROLE_LABELS = {
  gameplay_primary: 'gameplay primary',
  engine_host_bridge_tooling: 'Unity host/bridge/tooling',
  gameplay_runtime_primary: 'gameplay/runtime primary',
  secondary_or_unconfirmed: 'secondary or unconfirmed',
  secondary_runtime: 'secondary runtime',
  native_runtime_primary: 'native/runtime primary',
  visual_scripting_assets: 'visual scripting assets',
  supporting_or_unclassified: 'supporting or unclassified',
};

function formatProfileEngine(profile, fallback = '') {
  const engine = profile?.engine;
  if (!engine) return fallback;
  const name = ENGINE_NAMES[engine.name] || engine.name || '';
  if (!name || name === 'Unknown') return fallback || name;
  return engine.version ? `${name} ${engine.version}` : name;
}

function formatRole(role) {
  if (!role?.language) return '';
  const label = ROLE_LABELS[role.role] || String(role.role || '').replace(/_/g, ' ');
  return label ? `${role.language} = ${label}` : role.language;
}

/**
 * Format project-memory.json as a short markdown context summary.
 *
 * @param {object} memory - Parsed project-memory.json.
 * @param {string} [lang] - Configured interaction language.
 * @returns {string} Markdown summary, or an empty string when there is nothing to inject.
 */
export function formatContextSummary(memory, lang) {
  if (!memory) return '';

  const sections = [];

  const tech = memory.techStack;
  if (tech && (tech.engine || tech.languages?.length || tech.buildTool || tech.testTool)) {
    const lines = ['### [Project Environment]'];
    if (tech.engine) lines.push(`- Engine: ${tech.engine}`);
    if (tech.languages?.length) lines.push(`- Languages: ${tech.languages.join(', ')}`);
    if (tech.buildTool) lines.push(`- Build: ${tech.buildTool}`);
    if (tech.testTool) lines.push(`- Test: ${tech.testTool}`);
    sections.push(lines.join('\n'));
  }

  const profile = memory.projectProfile;
  if (profile) {
    const lines = ['### [Project Profile]'];
    const engine = formatProfileEngine(profile, tech?.engine || '');
    if (engine) lines.push(`- Engine: ${engine}`);

    const roles = (profile.languages?.roles || [])
      .map(formatRole)
      .filter(Boolean)
      .slice(0, 6);
    if (roles.length) lines.push(`- Language roles: ${roles.join('; ')}`);

    const directories = (profile.directories || [])
      .filter((dir) => dir?.path && dir?.purpose)
      .slice(0, 12);
    if (directories.length) {
      lines.push('- Key directories:');
      for (const dir of directories) {
        lines.push(`  - ${dir.path}: ${dir.purpose}`);
      }
    }

    if (lines.length > 1) sections.push(lines.join('\n'));
  }

  if (memory.hotPaths?.length) {
    const sorted = [...memory.hotPaths]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10);
    const lines = ['### [Hot Paths]'];
    for (const hp of sorted) {
      lines.push(`- ${hp.path} (${t(lang, 'hotPathAccess', hp.count || 0)})`);
    }
    sections.push(lines.join('\n'));
  }

  if (memory.userDirectives?.length) {
    const lines = ['### [Directives]'];
    for (const d of memory.userDirectives) {
      lines.push(`- ${d}`);
    }
    sections.push(lines.join('\n'));
  }

  if (memory.customNotes?.length) {
    const lines = ['### [Recent Learnings]'];
    for (const note of memory.customNotes.slice(-5)) {
      lines.push(`- ${note}`);
    }
    sections.push(lines.join('\n'));
  }

  if (sections.length === 0) return '';

  return '## Seed Project Context\n\n' + sections.join('\n\n');
}
