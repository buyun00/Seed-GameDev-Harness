import { z } from 'zod';
import { ConstitutionAnalyzer } from '../../analyzers/constitution-analyzer.js';
import { AnchorMatcher } from '../../core/anchor-matcher.js';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
export function registerConstitutionTools(server, ctx) {
    const analyzer = new ConstitutionAnalyzer(ctx);
    server.tool('get_constitution_analysis', 'Get the current constitution analysis status and extracted rules', {}, async () => {
        const cached = await ctx.cache.get('constitution-analysis');
        if (!cached) {
            return { content: [{ type: 'text', text: JSON.stringify({ status: 'none', rules: [] }) }] };
        }
        const freshness = await analyzer.checkFreshness(cached);
        const result = {
            status: freshness.fresh ? 'up_to_date' : 'outdated',
            analyzedAt: cached.analyzedAt,
            rules: cached.rules,
            statusSummary: cached.statusSummary,
            changedFiles: freshness.changedFiles,
        };
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    });
    server.tool('run_constitution_analysis', 'Analyze CLAUDE.md files and extract structured rule blocks', { force: z.boolean().optional().describe('Force re-analysis even if up-to-date') }, async ({ force }) => {
        if (!force) {
            const cached = await ctx.cache.get('constitution-analysis');
            if (cached) {
                const freshness = await analyzer.checkFreshness(cached);
                if (freshness.fresh) {
                    return { content: [{ type: 'text', text: JSON.stringify({ status: 'up_to_date', analyzedAt: cached.analyzedAt }) }] };
                }
            }
        }
        const result = await analyzer.analyze();
        await ctx.cache.set('constitution-analysis', result);
        return { content: [{ type: 'text', text: JSON.stringify({ status: 'analyzed', ...result.statusSummary, analyzedAt: result.analyzedAt }) }] };
    });
    server.tool('propose_constitution_edit', 'Propose an edit to an existing constitution rule block', {
        ruleId: z.string().describe('ID of the rule to edit'),
        changes: z.object({
            title: z.string().optional(),
            normalizedText: z.string().optional(),
        }).describe('Changes to apply'),
        editIntent: z.string().describe('Description of the edit intent'),
    }, async ({ ruleId, changes, editIntent }) => {
        const cached = await ctx.cache.get('constitution-analysis');
        if (!cached) {
            return { content: [{ type: 'text', text: JSON.stringify({ error: 'No analysis. Run analysis first.' }) }] };
        }
        const rule = cached.rules.find(r => r.id === ruleId);
        if (!rule) {
            return { content: [{ type: 'text', text: JSON.stringify({ error: `Rule ${ruleId} not found` }) }] };
        }
        const absPath = ctx.projectContext.resolve(rule.sourceFile);
        if (!existsSync(absPath)) {
            return { content: [{ type: 'text', text: JSON.stringify({ error: 'Source file not found' }) }] };
        }
        const currentContent = await readFile(absPath, 'utf-8');
        const matcher = new AnchorMatcher();
        const match = matcher.match(rule, currentContent);
        if (!match.found) {
            return { content: [{ type: 'text', text: JSON.stringify({ error: 'anchor_mismatch', message: match.reason }) }] };
        }
        const proposal = await analyzer.proposeEdit(rule, {
            category: rule.category,
            normalizedText: changes.normalizedText ?? rule.normalizedText,
            scopeMode: 'current_rule',
            scopeDescription: editIntent,
        }, cached);
        return { content: [{ type: 'text', text: JSON.stringify({ proposalId: proposal.id, summary: proposal.summary }) }] };
    });
    server.tool('propose_new_rule_block', 'Propose adding a new rule block to a constitution file', {
        title: z.string().describe('Title of the new rule'),
        content: z.string().describe('Content of the new rule'),
        targetFile: z.string().describe('Target file (e.g. CLAUDE.md)'),
        insertAfterSection: z.string().optional().describe('Section heading to insert after'),
    }, async ({ title, content, targetFile, insertAfterSection }) => {
        const proposal = await analyzer.proposeCreate({ title, content, targetFile, insertAfterSection });
        return { content: [{ type: 'text', text: JSON.stringify({ proposalId: proposal.id, summary: proposal.summary }) }] };
    });
}
