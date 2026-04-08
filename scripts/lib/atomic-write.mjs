/**
 * Seed hook 脚本的原子文件写入工具。
 * 无外部依赖的独立模块。
 */

import { openSync, writeSync, fsyncSync, closeSync, renameSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { dirname, basename, join } from 'path';
import { randomUUID } from 'crypto';

/**
 * 确保目录存在。
 */
export function ensureDirSync(dir) {
  if (existsSync(dir)) {
    return;
  }
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    if (err.code === 'EEXIST') {
      return;
    }
    throw err;
  }
}

/**
 * 原子地将字符串内容写入文件。
 * 使用临时文件 + 原子重命名模式，配合 fsync 确保持久性。
 *
 * @param {string} filePath 目标文件路径
 * @param {string} content 要写入的字符串内容
 */
export function atomicWriteFileSync(filePath, content) {
  const dir = dirname(filePath);
  const base = basename(filePath);
  const tempPath = join(dir, `.${base}.tmp.${randomUUID()}`);

  let fd = null;
  let success = false;

  try {
    ensureDirSync(dir);

    fd = openSync(tempPath, 'wx', 0o600);
    writeSync(fd, content, 0, 'utf-8');
    fsyncSync(fd);
    closeSync(fd);
    fd = null;

    renameSync(tempPath, filePath);
    success = true;

    try {
      const dirFd = openSync(dir, 'r');
      try {
        fsyncSync(dirFd);
      } finally {
        closeSync(dirFd);
      }
    } catch {
      // 某些平台不支持目录 fsync
    }
  } finally {
    if (fd !== null) {
      try { closeSync(fd); } catch { /* 忽略 */ }
    }
    if (!success) {
      try { unlinkSync(tempPath); } catch { /* 忽略 */ }
    }
  }
}
