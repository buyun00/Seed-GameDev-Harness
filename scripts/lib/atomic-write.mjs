/**
 * Atomic file writes for Seed hooks.
 * Self-contained module with no external dependencies.
 */

import { openSync, writeSync, fsyncSync, closeSync, renameSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { dirname, basename, join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Ensure directory exists.
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
 * Write string content atomically to a file.
 * Uses temp file + atomic rename pattern with fsync for durability.
 *
 * @param {string} filePath Target file path
 * @param {string} content String content to write
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
      // Some platforms don't support directory fsync
    }
  } finally {
    if (fd !== null) {
      try { closeSync(fd); } catch { /* ignore */ }
    }
    if (!success) {
      try { unlinkSync(tempPath); } catch { /* ignore */ }
    }
  }
}
