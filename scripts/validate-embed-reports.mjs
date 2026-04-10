#!/usr/bin/env node
/**
 * Validate /seed:embed matrix researcher reports without external dependencies.
 *
 * This is a gate helper, not a complete YAML parser. It verifies that the
 * expected report files exist, contain substantial YAML-like content, and
 * expose the required single-matrix report contract from researcher-common.md.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [, , reportsDir, ...matrixIds] = process.argv;

const REQUIRED_SECTIONS = [
  ['通用规则执行结果', 'common_rule_results', 'common_rules'],
  ['运行时固定问题结果', '运行时必查项结果', 'runtime_fixed_question_results', 'runtime_required_results', 'runtime_required_checks'],
  ['领域发现', 'domain_findings', 'findings'],
  ['固定问题回答', 'fixed_question_results', 'fixed_questions'],
];

const MATRIX_ID_PATTERN = /(?:engine\.[a-z0-9_]+\.[a-z0-9_]+|capability\.[a-z0-9_]+)/gu;

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

function extractTopLevelScalar(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^${escaped}:\\s*["']?([^"'#\\r\\n]+)["']?\\s*(?:#.*)?$`, 'mu'));
  return match ? match[1].trim() : '';
}

function unique(values) {
  return [...new Set(values)];
}

function validateOne(matrixId) {
  const file = join(reportsDir, `${matrixId}.yaml`);
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

  const text = readFileSync(file, 'utf8').replace(/^\uFEFF/u, '');
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

  const topLevelMatrixId = extractTopLevelScalar(text, 'matrix_id');
  if (!topLevelMatrixId) {
    fail(`missing top-level matrix_id: ${file}`);
  } else if (topLevelMatrixId !== matrixId) {
    fail(`top-level matrix_id mismatch in ${file}: expected ${matrixId}, got ${topLevelMatrixId}`);
  }

  const outputFile = extractTopLevelScalar(text, 'output_file');
  if (!outputFile) {
    fail(`missing top-level output_file: ${file}`);
  }

  const fixedQuestionFile = extractTopLevelScalar(text, 'fixed_question_file');
  if (!fixedQuestionFile) {
    fail(`missing top-level fixed_question_file: ${file}`);
  }

  const allMatrixIds = unique(text.match(MATRIX_ID_PATTERN) || []);
  const foreignMatrixIds = allMatrixIds.filter((id) => id !== matrixId);
  if (foreignMatrixIds.length > 0) {
    fail(`report contains foreign matrix_id(s) in ${file}: ${foreignMatrixIds.join(', ')}`);
  }

  const fixedQuestionMatch = text.match(/(^|\n)\s*fixed_question_results\s*:/u);
  if (!fixedQuestionMatch || typeof fixedQuestionMatch.index !== 'number') {
    fail(`missing machine-readable fixed_question_results section: ${file}`);
  } else {
    const fixedQuestionText = text.slice(fixedQuestionMatch.index);
    const fixedQuestionMatrixIds = unique(fixedQuestionText.match(MATRIX_ID_PATTERN) || []);
    if (fixedQuestionMatrixIds.length === 0) {
      fail(`fixed_question_results missing matrix_id: ${file}`);
    }
    const foreignFixedQuestionMatrixIds = fixedQuestionMatrixIds.filter((id) => id !== matrixId);
    if (foreignFixedQuestionMatrixIds.length > 0) {
      fail(`fixed_question_results contains foreign matrix_id(s) in ${file}: ${foreignFixedQuestionMatrixIds.join(', ')}`);
    }
  }
}

if (!reportsDir || matrixIds.length === 0) {
  fail('usage: node scripts/validate-embed-reports.mjs <reports_dir> <matrix_id> [matrix_id...]');
} else if (!existsSync(reportsDir)) {
  fail(`reports_dir does not exist: ${reportsDir}`);
} else {
  for (const matrixId of matrixIds) {
    validateOne(matrixId);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log(`embed matrix report gate ok: ${matrixIds.length} report(s) checked`);
