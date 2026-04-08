/**
 * Seed hook 脚本的轻量级国际化工具。
 *
 * 从 .seed/config.json 读取语言设置，并提供
 * hook 输出消息的本地化字符串。
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
 * 从原始配置值解析语言代码。
 * 支持代码形式（如 "en"、"zh"、"ja"、"ko"）和显示名称。
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
 * 从 .seed/config.json 读取语言设置。
 * @param {string} cwd - 项目工作目录
 * @returns {string} 配置中的原始语言值，或空字符串
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
 * 根据 key 获取本地化字符串。
 * @param {string} lang - 配置中的原始语言值
 * @param {string} key - 字符串键
 * @param  {...any} args - 传递给字符串函数的参数
 * @returns {string}
 */
export function t(lang, key, ...args) {
  const code = resolveLanguageCode(lang);
  const bundle = strings[code] || strings.en;
  const value = bundle[key] ?? strings.en[key];
  return typeof value === 'function' ? value(...args) : value;
}

/**
 * 构建语言指令消息用于 session 上下文注入。
 * @param {string} lang - 配置中的原始语言值
 * @returns {string} 指令文本，如果未配置语言则返回空字符串
 */
export function buildLanguageDirective(lang) {
  if (!lang) return '';
  return `### [Language Directive]\nYou MUST use **${lang}** for ALL responses, questions, code comments, documentation, task descriptions, and agent communications. This applies to every interaction in this session.`;
}
