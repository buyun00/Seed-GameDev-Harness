#!/usr/bin/env node
/**
 * Validate /seed:embed researcher reports without external dependencies.
 *
 * This is a gate helper, not a complete YAML parser. It verifies that the
 * expected report files exist, contain substantial YAML-like content, and
 * expose the three required report sections from researcher-common.md.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [, , reportsDir, ...domains] = process.argv;

const REQUIRED_SECTIONS = [
  ['通用规则执行结果', 'common_rule_results', 'common_rules'],
  ['运行时必查项结果', 'runtime_required_results', 'runtime_required_checks'],
  ['领域发现', 'domain_findings', 'findings'],
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function hasAnySection(text, names) {
  return names.some((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\n)\\s*${escaped}\\s*:`, 'u').test(text)
      || new RegExp(`(^|\\n)\\s*#*\\s*${escaped}\\s*$`, 'u').test(text);
  });
}

function validateOne(domain) {
  const file = join(reportsDir, `researcher-${domain}.yaml`);
  const tmp = `${file}.tmp`;

  if (!existsSync(file)) {
    fail(`missing: ${file}`);
    return;
  }

  if (existsSync(tmp)) {
    fail(`tmp file still exists, atomic rename may not have completed: ${tmp}`);
  }

  const stats = statSync(file);
  if (stats.size < 128) {
    fail(`too small to be a substantive report: ${file} (${stats.size} bytes)`);
    return;
  }

  const text = readFileSync(file, 'utf8');
  if (/^\s*```/mu.test(text)) {
    fail(`report must be raw yaml, not fenced markdown: ${file}`);
  }
  if (/\t/.test(text)) {
    fail(`tabs found; yaml indentation must use spaces: ${file}`);
  }
  if (/<<<<<<<|=======|>>>>>>>/.test(text)) {
    fail(`merge conflict marker found: ${file}`);
  }

  for (const names of REQUIRED_SECTIONS) {
    if (!hasAnySection(text, names)) {
      fail(`missing required report section (${names.join(' | ')}): ${file}`);
    }
  }
}

if (!reportsDir || domains.length === 0) {
  fail('usage: node scripts/validate-embed-reports.mjs <reports_dir> <domain> [domain...]');
} else if (!existsSync(reportsDir)) {
  fail(`reports_dir does not exist: ${reportsDir}`);
} else {
  for (const domain of domains) {
    validateOne(domain.replace(/^researcher-/, ''));
  }

  const leftovers = readdirSync(reportsDir).filter((name) => name.endsWith('.tmp'));
  if (leftovers.length > 0) {
    fail(`tmp files remain in reports_dir: ${leftovers.join(', ')}`);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log(`embed report gate ok: ${domains.length} report(s) checked`);
