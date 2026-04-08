/**
 * Seed hook 脚本的共享 stdin 工具。
 * 提供带超时保护的 stdin 读取，防止在 Linux 和 Windows 上无限挂起。
 */

/**
 * 带超时的 stdin 全量读取，防止无限挂起。
 *
 * @param {number} timeoutMs - 等待 stdin 的最大时间（默认：5000ms）
 * @returns {Promise<string>} - stdin 内容，错误/超时时返回空字符串
 */
export async function readStdin(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const chunks = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        process.stdin.removeAllListeners();
        process.stdin.destroy();
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    }, timeoutMs);

    process.stdin.on('data', (chunk) => {
      chunks.push(chunk);
    });

    process.stdin.on('end', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    });

    process.stdin.on('error', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve('');
      }
    });

    if (process.stdin.readableEnded) {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    }
  });
}
