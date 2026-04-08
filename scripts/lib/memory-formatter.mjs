/**
 * Seed hook 脚本的共享记忆格式化工具。
 * 将 project-memory.json 格式化为 Seed 项目上下文摘要，
 * 同时用于 SessionStart 注入和 PreCompact 保护。
 */

import { t } from './i18n.mjs';

/**
 * 将 project-memory.json 对象格式化为 markdown 摘要。
 *
 * @param {object} memory - 解析后的 project-memory.json 内容
 * @param {string} [lang] - 配置中的语言设置（原始值）
 * @returns {string} 格式化的 markdown 摘要，如果没有内容则返回空字符串
 */
export function formatContextSummary(memory, lang) {
  if (!memory) return '';

  const sections = [];

  // [项目环境]
  const tech = memory.techStack;
  if (tech && (tech.engine || tech.languages?.length || tech.buildTool || tech.testTool)) {
    const lines = ['### [Project Environment]'];
    if (tech.engine) lines.push(`- Engine: ${tech.engine}`);
    if (tech.languages?.length) lines.push(`- Languages: ${tech.languages.join(', ')}`);
    if (tech.buildTool) lines.push(`- Build: ${tech.buildTool}`);
    if (tech.testTool) lines.push(`- Test: ${tech.testTool}`);
    sections.push(lines.join('\n'));
  }

  // [热点路径]
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

  // [用户指令]
  if (memory.userDirectives?.length) {
    const lines = ['### [Directives]'];
    for (const d of memory.userDirectives) {
      lines.push(`- ${d}`);
    }
    sections.push(lines.join('\n'));
  }

  // [近期学习]
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
