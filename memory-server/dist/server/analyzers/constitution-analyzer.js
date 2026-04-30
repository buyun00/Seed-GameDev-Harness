import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createPatch } from 'diff';
import { hashString } from '../utils/hash.js';
import { extractImports } from '../utils/markdown.js';
import { runConstitutionAnalysisPipeline } from '../core/constitution-analysis-runner.js';
import { agentQuery } from '../worker/agents/base-agent.js';
import { finalizeComparedRules, parseConstitutionAnalysisResult, summarizeConstitutionRules, } from '../utils/constitution-analysis.js';
export class ConstitutionAnalyzer {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /**
     * Run analysis. If taskQueue is available, submits as a background task
     * and waits (sync wrapper). Otherwise falls back to direct invocation.
     */
    async analyze() {
        if (this.ctx.taskQueue) {
            const taskId = this.ctx.taskQueue.enqueue('constitution_analysis', {
                projectPath: this.ctx.projectContext.projectRoot,
            });
            const task = await this.ctx.taskQueue.waitForTask(taskId, 600_000);
            if (task.status === 'completed' && task.result) {
                return task.result;
            }
            if (task.status === 'failed') {
                throw new Error(task.error || 'Constitution analysis failed');
            }
            throw new Error('Constitution analysis timed out');
        }
        return this.directAnalyze();
    }
    async directAnalyze() {
        return runConstitutionAnalysisPipeline(this.ctx);
    }
    async checkFreshness(cached) {
        const changed = [];
        for (const src of cached.sources) {
            const absPath = this.ctx.projectContext.resolve(src.path);
            if (!existsSync(absPath)) {
                changed.push(src.path);
                continue;
            }
            const content = await readFile(absPath, 'utf-8');
            if (hashString(content) !== src.hash) {
                changed.push(src.path);
            }
        }
        for (const src of cached.importedSources) {
            const absPath = this.ctx.projectContext.resolve(src.path);
            if (!existsSync(absPath)) {
                changed.push(src.path);
                continue;
            }
            const content = await readFile(absPath, 'utf-8');
            if (hashString(content) !== src.hash) {
                changed.push(src.path);
            }
        }
        const currentConstitutionFiles = this.ctx.projectContext.constitutionFiles;
        for (const absPath of currentConstitutionFiles) {
            try {
                const content = await readFile(absPath, 'utf-8');
                const currentImports = extractImports(content);
                for (const imp of currentImports) {
                    const exists = cached.imports.some(ci => ci.resolvedPath === imp.directive && ci.sourceFile === this.ctx.projectContext.relative(absPath));
                    if (!exists) {
                        changed.push(`[new import] @${imp.directive}`);
                    }
                }
            }
            catch {
                // skip unreadable file
            }
        }
        return { fresh: changed.length === 0, changedFiles: changed };
    }
    async proposeEdit(rule, changes, cached) {
        const editableFiles = await Promise.all(this.ctx.projectContext.constitutionFiles.map(async (absPath) => {
            const path = this.ctx.projectContext.relative(absPath);
            return {
                path,
                content: await readFile(absPath, 'utf-8'),
            };
        }));
        const prompt = `You are editing one or more Claude Code constitution files.

Primary selected rule:
${JSON.stringify({
            id: rule.id,
            sourceFile: rule.sourceFile,
            sourceSpan: rule.sourceSpan,
            category: rule.category,
            normalizedText: rule.normalizedText,
            originalExcerpt: rule.originalExcerpt,
        }, null, 2)}

Requested target category: ${changes.category}
Requested rule content:
${changes.normalizedText}

Requested scope mode: ${changes.scopeMode}
Requested scope description:
${changes.scopeDescription}

Existing extracted rules:
${JSON.stringify(cached.rules.map(item => ({
            id: item.id,
            sourceFile: item.sourceFile,
            category: item.category,
            status: item.status,
            normalizedText: item.normalizedText,
        })), null, 2)}

Editable constitution files:
${JSON.stringify(editableFiles, null, 2)}

Modify the files according to the request. Return strict JSON only:
{
  "summary": "short summary",
  "files": [
    {
      "path": "CLAUDE.md",
      "content": "complete modified file content",
      "extractedRules": [
        "L10-10 :: core_principles :: 核心原则 :: 事实必须分散流动，方向必须集中裁决"
      ]
    }
  ]
}

Rules:
- Include only files that actually changed.
- path must be one of the editable file paths provided above.
- content must be the COMPLETE file content after modification.
- extractedRules must list ALL extracted rules for that changed file after modification, using the exact extraction line format.
- Do not wrap the JSON in markdown fences.
- Do not add prose before or after the JSON object.`;
        const result = await agentQuery({
            prompt,
            cwd: this.ctx.projectContext.projectRoot,
            timeoutMs: 120_000,
        });
        const parsed = this.parseProposalEditResult(result, editableFiles);
        const affectedFiles = parsed.files.map(file => {
            const original = editableFiles.find(candidate => candidate.path === file.path)?.content ?? '';
            return {
                path: file.path,
                action: original ? 'modify' : 'create',
                diff: createPatch(file.path, original, file.content, 'original', 'proposed'),
                originalContent: original || undefined,
                proposedContent: file.content,
            };
        });
        const proposal = {
            id: randomUUID(),
            type: 'constitution_edit',
            source: `Edit rule: ${rule.normalizedText}`,
            affectedFiles,
            summary: parsed.summary || `Edit constitution rule: ${rule.normalizedText}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            constitutionPatch: {
                files: parsed.files.map(file => ({
                    path: file.path,
                    rules: parseConstitutionAnalysisResult(file.extractedRules.join('\n'), { path: file.path, content: file.content }),
                })),
            },
        };
        await this.saveProposal(proposal);
        return proposal;
    }
    async proposeCreate(params) {
        const absPath = this.ctx.projectContext.resolve(params.targetFile);
        let currentContent = '';
        if (existsSync(absPath)) {
            currentContent = await readFile(absPath, 'utf-8');
        }
        const prompt = `You are editing a Claude Code configuration file. Current content:

\`\`\`
${currentContent}
\`\`\`

Add a new rule block:
Title: ${params.title}
Content: ${params.content}
${params.insertAfterSection ? `Insert after section: ${params.insertAfterSection}` : 'Append to the end of the file.'}

Output the COMPLETE modified file content. Output raw file content only, no markdown fencing.`;
        const result = await agentQuery({
            prompt,
            cwd: this.ctx.projectContext.projectRoot,
            timeoutMs: 120_000,
        });
        const proposedContent = result.trim();
        const diff = createPatch(params.targetFile, currentContent, proposedContent, 'original', 'proposed');
        const proposal = {
            id: randomUUID(),
            type: 'constitution_create',
            source: `New rule: ${params.title}`,
            affectedFiles: [{
                    path: params.targetFile,
                    action: currentContent ? 'modify' : 'create',
                    diff,
                    originalContent: currentContent || undefined,
                    proposedContent,
                }],
            summary: `Create new constitution rule: "${params.title}"`,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        await this.saveProposal(proposal);
        return proposal;
    }
    async saveProposal(proposal) {
        const filePath = `${this.ctx.projectContext.proposalsDir}/${proposal.id}.json`;
        await this.ctx.writer.write(filePath, JSON.stringify(proposal, null, 2));
        this.ctx.sseEmitter.emit('proposal:created', { id: proposal.id, type: proposal.type });
    }
    async refreshCachedAnalysisFromProposal(proposal) {
        if (!proposal.constitutionPatch?.files?.length)
            return;
        const cached = await this.ctx.cache.get('constitution-analysis');
        if (!cached)
            return;
        const changedPaths = new Set(proposal.constitutionPatch.files.map(file => file.path));
        const previousRules = cached.rules.filter(rule => changedPaths.has(rule.sourceFile));
        const previousRuleIds = new Set(previousRules.map(rule => rule.id));
        const previousCategories = new Set(previousRules.map(rule => rule.category));
        const untouchedRules = cached.rules
            .filter(rule => !changedPaths.has(rule.sourceFile))
            .map(rule => {
            const filteredRelations = rule.relations.filter(relation => !previousRuleIds.has(relation.targetRuleId));
            const touchedByPatch = filteredRelations.length !== rule.relations.length || previousCategories.has(rule.category);
            return touchedByPatch
                ? { ...rule, status: 'unresolved', relations: filteredRelations }
                : rule;
        });
        const patchedRules = proposal.constitutionPatch.files.flatMap(file => file.rules);
        const rules = finalizeComparedRules([...untouchedRules, ...patchedRules]);
        const sources = await this.buildUpdatedSources(cached.sources);
        const imports = cached.imports;
        const importedSources = cached.importedSources;
        const statusSummary = summarizeConstitutionRules(rules);
        await this.ctx.cache.set('constitution-analysis', {
            ...cached,
            analyzedAt: new Date().toISOString(),
            sources,
            imports,
            importedSources,
            rules,
            relations: rules.flatMap(current => current.relations),
            statusSummary,
        });
    }
    parseProposalEditResult(rawResult, editableFiles) {
        const parsed = this.tryParseObject(rawResult);
        if (!parsed) {
            throw new Error('Proposal generation returned invalid JSON');
        }
        const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
        const files = Array.isArray(parsed.files) ? parsed.files : [];
        const allowedPaths = new Set(editableFiles.map(file => file.path));
        const normalizedFiles = files
            .map(file => this.normalizeProposalEditFile(file, allowedPaths))
            .filter((file) => file !== null);
        if (normalizedFiles.length === 0) {
            throw new Error('Proposal generation returned no changed files');
        }
        return { summary, files: normalizedFiles };
    }
    normalizeProposalEditFile(rawFile, allowedPaths) {
        if (!rawFile || typeof rawFile !== 'object')
            return null;
        const record = rawFile;
        const path = typeof record.path === 'string' ? record.path.trim() : '';
        const content = typeof record.content === 'string' ? record.content : '';
        const extractedRules = Array.isArray(record.extractedRules)
            ? record.extractedRules.filter((line) => typeof line === 'string' && line.trim().length > 0)
            : [];
        if (!path || !allowedPaths.has(path) || !content.trim() || extractedRules.length === 0) {
            return null;
        }
        return {
            path,
            content: content.trimEnd(),
            extractedRules,
        };
    }
    tryParseObject(raw) {
        const candidates = new Set();
        const trimmed = raw.trim();
        if (trimmed)
            candidates.add(trimmed);
        const fencedMatches = raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi);
        for (const match of fencedMatches) {
            if (match[1]?.trim())
                candidates.add(match[1].trim());
        }
        const balanced = this.extractBalancedJsonObject(raw);
        if (balanced)
            candidates.add(balanced);
        for (const candidate of candidates) {
            try {
                const parsed = JSON.parse(candidate);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed;
                }
            }
            catch {
                // ignore invalid candidate
            }
        }
        return null;
    }
    extractBalancedJsonObject(raw) {
        let start = -1;
        let depth = 0;
        let inString = false;
        let escaped = false;
        for (let index = 0; index < raw.length; index++) {
            const char = raw[index];
            if (start === -1) {
                if (char === '{') {
                    start = index;
                    depth = 1;
                }
                continue;
            }
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (inString)
                continue;
            if (char === '{')
                depth++;
            if (char === '}')
                depth--;
            if (depth === 0) {
                return raw.slice(start, index + 1);
            }
        }
        return null;
    }
    async buildUpdatedSources(previousSources) {
        const next = [];
        for (const source of previousSources) {
            const absPath = this.ctx.projectContext.resolve(source.path);
            if (!existsSync(absPath))
                continue;
            const content = await readFile(absPath, 'utf-8');
            const fileStat = await stat(absPath);
            next.push({
                path: source.path,
                hash: hashString(content),
                size: content.length,
                lastModified: fileStat.mtime.toISOString(),
            });
        }
        return next;
    }
}
