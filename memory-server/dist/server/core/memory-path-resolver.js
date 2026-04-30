import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
export class MemoryPathResolver {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    resolve() {
        const settingsOverride = this.checkSettingsOverride();
        if (settingsOverride) {
            const resolved = settingsOverride.startsWith('~')
                ? join(homedir(), settingsOverride.slice(1))
                : resolve(settingsOverride);
            return {
                path: resolved,
                method: 'settings_override',
                hasMemoryMd: existsSync(join(resolved, 'MEMORY.md')),
                diagnostics: `Using autoMemoryDirectory setting: ${settingsOverride}`,
            };
        }
        const projectSlug = this.resolveProjectSlug();
        if (!projectSlug.slug) {
            return {
                path: null,
                method: 'not_found',
                hasMemoryMd: false,
                diagnostics: projectSlug.diagnostics,
            };
        }
        const memoryDir = join(homedir(), '.claude', 'projects', projectSlug.slug, 'memory');
        return {
            path: memoryDir,
            method: projectSlug.method,
            hasMemoryMd: existsSync(join(memoryDir, 'MEMORY.md')),
            diagnostics: `Resolved via ${projectSlug.method}: ${memoryDir}`,
        };
    }
    checkSettingsOverride() {
        const paths = [
            join(homedir(), '.claude', 'settings.json'),
            join(this.ctx.projectRoot, '.claude', 'settings.local.json'),
        ];
        for (const p of paths) {
            if (!existsSync(p))
                continue;
            try {
                const data = JSON.parse(readFileSync(p, 'utf-8'));
                if (data.autoMemoryDirectory)
                    return data.autoMemoryDirectory;
            }
            catch { /* skip */ }
        }
        return null;
    }
    resolveProjectSlug() {
        const root = this.ctx.projectRoot;
        const dotGitPath = join(root, '.git');
        if (existsSync(dotGitPath)) {
            const isFile = statSync(dotGitPath).isFile();
            if (isFile) {
                // worktree: .git is a file pointing to the real git dir
                try {
                    const commonDir = execSync('git rev-parse --git-common-dir', { cwd: root, encoding: 'utf-8' }).trim();
                    const resolved = resolve(root, commonDir);
                    // Go up from .git to get the main repo root
                    const mainRoot = resolve(resolved, '..');
                    return {
                        slug: this.slugify(mainRoot),
                        method: 'git_common_dir',
                        diagnostics: `Worktree detected, main repo: ${mainRoot}`,
                    };
                }
                catch (e) {
                    return { slug: null, method: 'not_found', diagnostics: `git rev-parse --git-common-dir failed: ${e}` };
                }
            }
            else {
                // normal repo
                try {
                    const toplevel = execSync('git rev-parse --show-toplevel', { cwd: root, encoding: 'utf-8' }).trim();
                    return {
                        slug: this.slugify(toplevel),
                        method: 'git_toplevel',
                        diagnostics: `Git repo root: ${toplevel}`,
                    };
                }
                catch (e) {
                    return { slug: null, method: 'not_found', diagnostics: `git rev-parse --show-toplevel failed: ${e}` };
                }
            }
        }
        // Not a git repo, use project root path
        return {
            slug: this.slugify(root),
            method: 'path_slug',
            diagnostics: `No git repo, using project root: ${root}`,
        };
    }
    slugify(absolutePath) {
        return absolutePath.replace(/\\/g, '/').replace(/\//g, '-').replace(/^-/, '');
    }
}
