import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { parseMarkdown } from '../utils/markdown.js';
import { createPatch } from 'diff';
import { agentQuery } from '../worker/agents/base-agent.js';
const CATEGORY_MAP = {
    '.claude/rules': 'rules',
    'docs': 'project_knowledge',
    'architecture': 'architecture',
    'research': 'research',
    'runbooks': 'runbooks',
    'ops': 'runbooks',
};
export class KnowledgeCategorizer {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    async getAll(category) {
        const assets = this.ctx.scanner.getByKind('knowledge');
        const objects = assets.map(asset => {
            const cat = this.categorize(asset.sourcePath);
            const affinity = this.inferAffinity(asset.sourcePath, cat);
            return {
                id: asset.id,
                title: asset.title,
                category: cat,
                summary: asset.summary,
                sourcePath: asset.sourcePath,
                tags: asset.tags,
                status: 'active',
                layerAffinity: affinity,
                updatedAt: asset.updatedAt,
            };
        });
        if (category) {
            return objects.filter(o => o.category === category);
        }
        return objects;
    }
    async getById(id) {
        const asset = this.ctx.scanner.getById(id);
        if (!asset || asset.kind !== 'knowledge')
            return null;
        const absPath = this.ctx.projectContext.resolve(asset.sourcePath);
        const raw = await readFile(absPath, 'utf-8');
        const { content } = parseMarkdown(raw);
        const cat = this.categorize(asset.sourcePath);
        return {
            id: asset.id,
            title: asset.title,
            category: cat,
            summary: asset.summary,
            sourcePath: asset.sourcePath,
            tags: asset.tags,
            status: 'active',
            layerAffinity: this.inferAffinity(asset.sourcePath, cat),
            updatedAt: asset.updatedAt,
            content,
        };
    }
    async proposeDistillation(knowledgeId, targetType) {
        const obj = await this.getById(knowledgeId);
        if (!obj)
            throw new Error(`Knowledge object ${knowledgeId} not found`);
        const prompt = targetType === 'rule'
            ? `Distill the following document into a concise rule suitable for .claude/rules/. Create a markdown file with appropriate frontmatter (paths if applicable). Source document:\n\n${obj.content}\n\nOutput the complete rule file content, no fencing.`
            : `Distill the following document into a concise memory note. Source document:\n\n${obj.content}\n\nOutput the complete memory file content, no fencing.`;
        const result = await agentQuery({
            prompt,
            cwd: this.ctx.projectContext.projectRoot,
            timeoutMs: 120_000,
        });
        const targetPath = targetType === 'rule'
            ? `.claude/rules/${obj.title.toLowerCase().replace(/\s+/g, '-')}.md`
            : `distilled-${obj.title.toLowerCase().replace(/\s+/g, '-')}.md`;
        const proposal = {
            id: randomUUID(),
            type: targetType === 'rule' ? 'distill_rule' : 'distill_memory',
            source: `Distill from: ${obj.sourcePath}`,
            affectedFiles: [{
                    path: targetPath,
                    action: 'create',
                    diff: createPatch(targetPath, '', result.trim(), '', 'proposed'),
                    proposedContent: result.trim(),
                }],
            summary: `Distill "${obj.title}" into ${targetType}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        const proposalPath = `${this.ctx.projectContext.proposalsDir}/${proposal.id}.json`;
        await this.ctx.writer.write(proposalPath, JSON.stringify(proposal, null, 2));
        this.ctx.sseEmitter.emit('proposal:created', { id: proposal.id, type: proposal.type });
        return proposal;
    }
    categorize(sourcePath) {
        for (const [prefix, cat] of Object.entries(CATEGORY_MAP)) {
            if (sourcePath.startsWith(prefix))
                return cat;
        }
        return 'uncategorized';
    }
    inferAffinity(sourcePath, category) {
        if (category === 'rules')
            return 'affects_constitution';
        if (category === 'architecture' || category === 'project_knowledge')
            return 'candidate_for_memory';
        return 'reference_only';
    }
}
