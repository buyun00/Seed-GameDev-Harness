/**
 * Shared memory formatter for Seed hooks.
 * Formats project-memory.json into the Seed Project Context summary
 * used by both SessionStart injection and PreCompact preservation.
 */

/**
 * Format a project-memory.json object into a markdown summary.
 *
 * @param {object} memory - Parsed project-memory.json content
 * @returns {string} Formatted markdown summary, or empty string if no content
 */
export function formatContextSummary(memory) {
  if (!memory) return '';

  const sections = [];

  // [Project Environment]
  const tech = memory.techStack;
  if (tech && (tech.engine || tech.languages?.length || tech.buildTool || tech.testTool)) {
    const lines = ['### [Project Environment]'];
    if (tech.engine) lines.push(`- Engine: ${tech.engine}`);
    if (tech.languages?.length) lines.push(`- Languages: ${tech.languages.join(', ')}`);
    if (tech.buildTool) lines.push(`- Build: ${tech.buildTool}`);
    if (tech.testTool) lines.push(`- Test: ${tech.testTool}`);
    sections.push(lines.join('\n'));
  }

  // [Hot Paths]
  if (memory.hotPaths?.length) {
    const sorted = [...memory.hotPaths]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10);
    const lines = ['### [Hot Paths]'];
    for (const hp of sorted) {
      lines.push(`- ${hp.path} (访问 ${hp.count || 0} 次)`);
    }
    sections.push(lines.join('\n'));
  }

  // [Directives]
  if (memory.userDirectives?.length) {
    const lines = ['### [Directives]'];
    for (const d of memory.userDirectives) {
      lines.push(`- ${d}`);
    }
    sections.push(lines.join('\n'));
  }

  // [Recent Learnings]
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
