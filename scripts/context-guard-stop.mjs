#!/usr/bin/env node
/**
 * Seed 上下文守卫 Hook（Stop 事件）
 *
 * 当上下文使用率超过警告阈值时建议刷新 session。
 *
 * 可通过 SEED_CONTEXT_GUARD_THRESHOLD 环境变量配置（默认：75%）。
 *
 * 安全规则：
 *   - 永远不阻塞 context_limit 停止（否则会导致压缩死锁）
 *   - 永远不阻塞用户主动停止（尊重 Ctrl+C / cancel）
 *   - 每个 transcript 最多阻塞 2 次（重试守卫防止无限循环）
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { getClaudeConfigDir } from './lib/config-dir.mjs';
import { readStdin } from './lib/stdin.mjs';

const THRESHOLD = parseInt(process.env.SEED_CONTEXT_GUARD_THRESHOLD || '75', 10);
const CRITICAL_THRESHOLD = 95;
const MAX_BLOCKS = 2;
const SESSION_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,255}$/;

function isContextLimitStop(data) {
  const reasons = [
    data.stop_reason,
    data.stopReason,
    data.end_turn_reason,
    data.endTurnReason,
    data.reason,
  ]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.toLowerCase().replace(/[\s-]+/g, '_'));
  const contextPatterns = [
    'context_limit', 'context_window', 'context_exceeded',
    'context_full', 'max_context', 'token_limit',
    'max_tokens', 'conversation_too_long', 'input_too_long',
  ];

  return reasons.some((reason) => contextPatterns.some(p => reason.includes(p)));
}

function isUserAbort(data) {
  if (data.user_requested || data.userRequested) return true;

  const reason = (data.stop_reason || data.stopReason || '').toLowerCase();
  const exactPatterns = ['aborted', 'abort', 'cancel', 'interrupt'];
  const substringPatterns = ['user_cancel', 'user_interrupt', 'ctrl_c', 'manual_stop'];

  return (
    exactPatterns.some(p => reason === p) ||
    substringPatterns.some(p => reason.includes(p))
  );
}

function estimateContextPercent(transcriptPath) {
  if (!transcriptPath) return 0;

  let fd = -1;
  try {
    if (!existsSync(transcriptPath)) return 0;
    const stat = statSync(transcriptPath);
    if (stat.size === 0) return 0;

    fd = openSync(transcriptPath, 'r');
    const readSize = Math.min(4096, stat.size);
    const buf = Buffer.alloc(readSize);
    readSync(fd, buf, 0, readSize, stat.size - readSize);
    closeSync(fd);
    fd = -1;

    const tail = buf.toString('utf-8');

    const windowMatch = tail.match(/"context_window"\s{0,5}:\s{0,5}(\d+)/g);
    const inputMatch = tail.match(/"input_tokens"\s{0,5}:\s{0,5}(\d+)/g);

    if (!windowMatch || !inputMatch) return 0;

    const lastWindow = parseInt(windowMatch[windowMatch.length - 1].match(/(\d+)/)[1], 10);
    const lastInput = parseInt(inputMatch[inputMatch.length - 1].match(/(\d+)/)[1], 10);

    if (lastWindow === 0) return 0;
    return Math.round((lastInput / lastWindow) * 100);
  } catch {
    return 0;
  } finally {
    if (fd !== -1) try { closeSync(fd); } catch { /* 忽略 */ }
  }
}

function getGuardFilePath(sessionId) {
  const configDir = getClaudeConfigDir();
  const guardDir = join(configDir, 'projects', '.seed-guards');
  try {
    mkdirSync(guardDir, { recursive: true, mode: 0o700 });
  } catch (err) {
    if (err?.code !== 'EEXIST') throw err;
  }
  return join(guardDir, `context-guard-${sessionId}.json`);
}

function getBlockCount(sessionId) {
  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) return 0;
  const guardFile = getGuardFilePath(sessionId);
  try {
    if (existsSync(guardFile)) {
      const data = JSON.parse(readFileSync(guardFile, 'utf-8'));
      return data.blockCount || 0;
    }
  } catch { /* 忽略 */ }
  return 0;
}

function incrementBlockCount(sessionId) {
  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) return;
  const guardFile = getGuardFilePath(sessionId);
  try {
    let count = 0;
    if (existsSync(guardFile)) {
      const data = JSON.parse(readFileSync(guardFile, 'utf-8'));
      count = data.blockCount || 0;
    }
    writeFileSync(guardFile, JSON.stringify({ blockCount: count + 1 }), { mode: 0o600 });
  } catch { /* 忽略 */ }
}

function buildStopRecoveryAdvice(contextPercent, blockCount) {
  const severity = contextPercent >= 90 ? 'CRITICAL' : 'HIGH';
  return `[Seed] 上下文使用率 ${contextPercent}%（${severity}，阈值：${THRESHOLD}%）。` +
    `请立即运行 /compact 后再继续。如果 /compact 无法完成，` +
    `停止创建新 agent，在新 session 中使用现有检查点恢复` +
    `（.seed/state、.seed/notepad.md）。（第 ${blockCount}/${MAX_BLOCKS} 次阻塞）`;
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    if (isContextLimitStop(data)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    if (isUserAbort(data)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const sessionId = data.session_id || data.sessionId || '';
    const transcriptPath = data.transcript_path || data.transcriptPath || '';
    const pct = estimateContextPercent(transcriptPath);

    if (pct >= CRITICAL_THRESHOLD) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    if (pct >= THRESHOLD) {
      const blockCount = getBlockCount(sessionId);
      if (blockCount >= MAX_BLOCKS) {
        console.log(JSON.stringify({ continue: true, suppressOutput: true }));
        return;
      }

      incrementBlockCount(sessionId);

      console.log(JSON.stringify({
        continue: false,
        decision: 'block',
        reason: buildStopRecoveryAdvice(pct, blockCount + 1)
      }));
      return;
    }

    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
