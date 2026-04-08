/**
 * Minimal i18n helper for Seed hook scripts.
 *
 * Reads the language setting from .seed/config.json and provides
 * localized strings for hook output messages.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SEED_DIR = '.seed';

const strings = {
  en: {
    teamStatusTip: '> Tip: If you have an unfinished agent team, use `/team status` to check.',
    hotPathAccess: (count) => `accessed ${count} times`,
  },
  zh: {
    teamStatusTip: '> Tip: 如果有未完成的 agent team，可用 `/team status` 查看。',
    hotPathAccess: (count) => `访问 ${count} 次`,
  },
  ja: {
    teamStatusTip: '> Tip: 未完了の agent team がある場合は `/team status` で確認できます。',
    hotPathAccess: (count) => `${count} 回アクセス`,
  },
  ko: {
    teamStatusTip: '> Tip: 완료되지 않은 agent team이 있으면 `/team status`로 확인하세요.',
    hotPathAccess: (count) => `${count}회 접근`,
  },
};

/**
 * Resolve a language code from the raw config value.
 * Supports codes like "en", "zh", "ja", "ko" and display names.
 */
function resolveLanguageCode(raw) {
  if (!raw) return 'en';
  const lower = raw.toLowerCase().trim();
  if (strings[lower]) return lower;

  const nameMap = {
    english: 'en',
    '中文': 'zh', chinese: 'zh',
    '日本語': 'ja', japanese: 'ja',
    '한국어': 'ko', korean: 'ko',
  };
  return nameMap[lower] || 'en';
}

/**
 * Read the language setting from .seed/config.json.
 * @param {string} cwd - project working directory
 * @returns {string} raw language value from config, or ''
 */
export function readLanguageConfig(cwd) {
  try {
    const configPath = join(cwd, SEED_DIR, 'config.json');
    if (!existsSync(configPath)) return '';
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.language || '';
  } catch {
    return '';
  }
}

/**
 * Get a localized string by key.
 * @param {string} lang - raw language value from config
 * @param {string} key - string key
 * @param  {...any} args - arguments passed to string functions
 * @returns {string}
 */
export function t(lang, key, ...args) {
  const code = resolveLanguageCode(lang);
  const bundle = strings[code] || strings.en;
  const value = bundle[key] ?? strings.en[key];
  return typeof value === 'function' ? value(...args) : value;
}

/**
 * Build the language directive message for session context injection.
 * @param {string} lang - raw language value from config
 * @returns {string} directive text, or empty string if no language configured
 */
export function buildLanguageDirective(lang) {
  if (!lang) return '';
  return `### [Language Directive]\nYou MUST use **${lang}** for ALL responses, questions, code comments, documentation, task descriptions, and agent communications. This applies to every interaction in this session.`;
}
