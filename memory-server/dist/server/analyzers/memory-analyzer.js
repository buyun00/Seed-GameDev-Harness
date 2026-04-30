import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { stableId } from '../utils/hash.js';
import { extractTitle, parseMarkdown } from '../utils/markdown.js';
import { createPatch } from 'diff';
import { agentQuery } from '../worker/agents/base-agent.js';
export class MemoryAnalyzer {
    ctx;
    pathResolver;
    constructor(ctx, pathResolver) {
        this.ctx = ctx;
        this.pathResolver = pathResolver;
    }
    async scan() {
        const resolved = this.pathResolver.resolve();
        if (!resolved.path || !existsSync(resolved.path)) {
            return {
                resolvedPath: resolved.path,
                resolutionMethod: resolved.method,
                hasMemoryMd: false,
                diagnostics: resolved.diagnostics,
                objects: [],
                summary: { total: 0, indexed: 0, unindexed: 0, stale: 0, duplicate: 0 },
            };
        }
        const objects = [];
        const indexEntries = new Set();
        // Parse MEMORY.md index
        const memoryMdPath = join(resolved.path, 'MEMORY.md');
        if (existsSync(memoryMdPath)) {
            const content = await readFile(memoryMdPath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const match = line.match(/[-*]\s+\[?([^\]]+)\]?\s*[-:]?\s*(.*)/);
                if (match) {
                    indexEntries.add(match[1].trim().toLowerCase());
                }
            }
        }
        // Scan topic files
        const files = await readdir(resolved.path);
        const STALE_DAYS = 30;
        for (const file of files) {
            if (!file.endsWith('.md'))
                continue;
            const filePath = join(resolved.path, file);
            const raw = await readFile(filePath, 'utf-8');
            const fileStat = await stat(filePath);
            const { frontmatter, content, excerpt } = parseMarkdown(raw);
            const title = extractTitle(raw, file);
            const isMemoryMd = file === 'MEMORY.md';
            const daysSinceModified = (Date.now() - fileStat.mtime.getTime()) / (1000 * 60 * 60 * 24);
            const isIndexed = isMemoryMd || indexEntries.has(file.replace('.md', '').toLowerCase());
            let status = 'indexed';
            if (!isIndexed)
                status = 'unindexed';
            if (daysSinceModified > STALE_DAYS)
                status = 'stale';
            objects.push({
                id: stableId(file),
                title,
                description: excerpt,
                type: frontmatter.type || 'project',
                sourcePath: file,
                indexed: isIndexed,
                indexEntry: isIndexed ? file : undefined,
                status,
                updatedAt: fileStat.mtime.toISOString(),
                content,
                frontmatter,
            });
        }
        const summary = {
            total: objects.length,
            indexed: objects.filter(o => o.status === 'indexed').length,
            unindexed: objects.filter(o => o.status === 'unindexed').length,
            stale: objects.filter(o => o.status === 'stale').length,
            duplicate: objects.filter(o => o.status === 'duplicate').length,
        };
        return {
            resolvedPath: resolved.path,
            resolutionMethod: resolved.method,
            hasMemoryMd: resolved.hasMemoryMd,
            diagnostics: resolved.diagnostics,
            objects,
            summary,
        };
    }
    async proposeEdit(memoryId, changes) {
        const result = await this.scan();
        const obj = result.objects.find(o => o.id === memoryId);
        if (!obj)
            throw new Error(`Memory object ${memoryId} not found`);
        if (!result.resolvedPath)
            throw new Error('Memory path not resolved');
        const absPath = join(result.resolvedPath, obj.sourcePath);
        const currentContent = await readFile(absPath, 'utf-8');
        const prompt = `Edit this memory file. Current content:

\`\`\`
${currentContent}
\`\`\`

Requested changes: ${JSON.stringify(changes)}

Output the COMPLETE modified file content. Output raw content only, no markdown fencing.`;
        const proposed = await agentQuery({
            prompt,
            cwd: this.ctx.projectContext.projectRoot,
            timeoutMs: 120_000,
        });
        const diff = createPatch(obj.sourcePath, currentContent, proposed.trim(), 'original', 'proposed');
        const proposal = {
            id: randomUUID(),
            type: 'memory_edit',
            source: `Edit memory: ${obj.title}`,
            affectedFiles: [{
                    path: join(result.resolvedPath, obj.sourcePath),
                    action: 'modify',
                    diff,
                    originalContent: currentContent,
                    proposedContent: proposed.trim(),
                }],
            summary: `Edit memory object: "${obj.title}"`,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        const proposalPath = `${this.ctx.projectContext.proposalsDir}/${proposal.id}.json`;
        await this.ctx.writer.write(proposalPath, JSON.stringify(proposal, null, 2));
        this.ctx.sseEmitter.emit('proposal:created', { id: proposal.id, type: proposal.type });
        return proposal;
    }
    async reindex() {
        const result = await this.scan();
        if (!result.resolvedPath)
            throw new Error('Memory path not resolved');
        const unindexed = result.objects.filter(o => o.status === 'unindexed' && o.sourcePath !== 'MEMORY.md');
        const actions = [];
        if (unindexed.length === 0) {
            return { indexed: result.summary.indexed, unindexed: 0, actions: ['All files are indexed.'] };
        }
        for (const obj of unindexed) {
            actions.push(`Would index: ${obj.sourcePath} - ${obj.title}`);
        }
        return {
            indexed: result.summary.indexed,
            unindexed: unindexed.length,
            actions,
        };
    }
}
