import test from 'node:test';
import assert from 'node:assert/strict';
import { formatContextSummary } from '../lib/memory-formatter.mjs';

test('memory formatter injects a compact Project Profile section', () => {
  const directories = Array.from({ length: 14 }, (_, index) => ({
    path: `Dir${index}`,
    purpose: `Purpose ${index}`,
    evidence: [],
    confidence: 'medium',
  }));
  const summary = formatContextSummary({
    techStack: {
      engine: 'Unity 2022.3.15f1',
      languages: ['C#', 'Lua'],
      buildTool: '',
      testTool: '',
    },
    projectProfile: {
      schemaVersion: 1,
      generatedAt: '2026-04-10T08:00:00.000Z',
      engine: { name: 'unity', version: '2022.3.15f1', evidence: ['ProjectSettings/ProjectVersion.txt'] },
      languages: {
        roles: [
          { language: 'Lua', role: 'gameplay_primary', summary: 'Lua gameplay.' },
          { language: 'C#', role: 'engine_host_bridge_tooling', summary: 'C# bridge.' },
        ],
      },
      directories,
    },
    hotPaths: [],
    userDirectives: [],
    customNotes: [],
  }, 'English');

  assert.match(summary, /### \[Project Profile\]/);
  assert.match(summary, /- Engine: Unity 2022\.3\.15f1/);
  assert.match(summary, /Language roles: Lua = gameplay primary; C# = Unity host\/bridge\/tooling/);
  assert.match(summary, /  - Dir0: Purpose 0/);
  assert.match(summary, /  - Dir11: Purpose 11/);
  assert.doesNotMatch(summary, /Dir12/);
});

test('memory formatter keeps old behavior when projectProfile is absent', () => {
  const summary = formatContextSummary({
    techStack: {
      engine: 'Godot config_version 5',
      languages: ['GDScript'],
      buildTool: '',
      testTool: '',
    },
    hotPaths: [],
    userDirectives: [],
    customNotes: [],
  }, 'English');

  assert.match(summary, /### \[Project Environment\]/);
  assert.doesNotMatch(summary, /### \[Project Profile\]/);
});
