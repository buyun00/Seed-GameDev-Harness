import { resolve, join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
export class ProjectContext {
    projectRoot;
    seedDir;
    cacheDir;
    proposalsDir;
    constructor(projectPath) {
        this.projectRoot = resolve(projectPath);
        this.seedDir = join(this.projectRoot, '.seed-memory');
        this.cacheDir = join(this.seedDir, 'cache');
        this.proposalsDir = join(this.seedDir, 'proposals');
    }
    async initialize() {
        await mkdir(this.cacheDir, { recursive: true });
        await mkdir(this.proposalsDir, { recursive: true });
    }
    resolve(...segments) {
        return join(this.projectRoot, ...segments);
    }
    relative(absolutePath) {
        const rel = absolutePath.replace(this.projectRoot, '').replace(/^[/\\]/, '');
        return rel.replace(/\\/g, '/');
    }
    get constitutionFiles() {
        const candidates = [
            'CLAUDE.md',
            '.claude/CLAUDE.md',
            'CLAUDE.local.md',
        ];
        return candidates
            .map(f => this.resolve(f))
            .filter(f => existsSync(f));
    }
    get rulesDir() {
        return this.resolve('.claude', 'rules');
    }
    get knowledgeDirs() {
        const dirs = ['docs', 'research', 'architecture', 'runbooks', 'ops'];
        return dirs.map(d => this.resolve(d)).filter(d => existsSync(d));
    }
}
