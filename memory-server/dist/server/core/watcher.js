import { watch } from 'chokidar';
export class Watcher {
    ctx;
    scanner;
    sseEmitter;
    fsWatcher = null;
    constructor(ctx, scanner, sseEmitter) {
        this.ctx = ctx;
        this.scanner = scanner;
        this.sseEmitter = sseEmitter;
    }
    start() {
        const patterns = [
            this.ctx.resolve('CLAUDE.md'),
            this.ctx.resolve('CLAUDE.local.md'),
            this.ctx.resolve('.claude', '**', '*.md'),
            ...this.ctx.knowledgeDirs.map(d => `${d}/**/*.md`),
        ];
        this.fsWatcher = watch(patterns, {
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 300 },
        });
        this.fsWatcher.on('change', (path) => {
            this.handleChange(path, 'change');
        });
        this.fsWatcher.on('add', (path) => {
            this.handleChange(path, 'add');
        });
        this.fsWatcher.on('unlink', (path) => {
            this.handleChange(path, 'unlink');
        });
    }
    stop() {
        this.fsWatcher?.close();
    }
    async handleChange(filePath, event) {
        const relativePath = this.ctx.relative(filePath);
        const kind = this.inferKind(relativePath);
        await this.scanner.scanFile(filePath, event);
        this.sseEmitter.emit('file:changed', { path: relativePath, kind });
        this.sseEmitter.emit('scan:updated', {});
    }
    inferKind(relativePath) {
        if (relativePath.includes('CLAUDE'))
            return 'constitution';
        if (relativePath.startsWith('.claude/rules'))
            return 'knowledge';
        return 'knowledge';
    }
}
