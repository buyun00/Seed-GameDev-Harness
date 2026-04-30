import { agentQuery } from './base-agent.js';
import { emitAgentLog } from './agent-utils.js';
export async function runKnowledgeDistill(ctx, params, signal) {
    const prompt = params.targetType === 'rule'
        ? `Distill the following document into a concise rule suitable for .claude/rules/. Create a markdown file with appropriate frontmatter (paths if applicable). Source document:\n\n${params.content}\n\nOutput the complete rule file content, no fencing.`
        : `Distill the following document into a concise memory note. Source document:\n\n${params.content}\n\nOutput the complete memory file content, no fencing.`;
    emitAgentLog(ctx.sseEmitter, 'knowledge', `Starting ${params.targetType} distillation: "${params.title}"`);
    const result = await agentQuery({
        prompt,
        cwd: ctx.projectContext.projectRoot,
        timeoutMs: 120_000,
        signal,
        disallowedTools: ['Write', 'Edit', 'MultiEdit', 'Shell', 'WebFetch', 'WebSearch'],
        label: 'Knowledge',
        onLog: (msg) => emitAgentLog(ctx.sseEmitter, 'knowledge', msg),
    });
    emitAgentLog(ctx.sseEmitter, 'knowledge', `Distillation complete: "${params.title}"`);
    return result;
}
