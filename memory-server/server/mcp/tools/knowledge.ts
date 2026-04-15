import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AppContext } from '../../types.js'
import { KnowledgeCategorizer } from '../../analyzers/knowledge-categorizer.js'

export function registerKnowledgeTools(server: McpServer, ctx: AppContext) {
  const categorizer = new KnowledgeCategorizer(ctx)

  server.tool(
    'list_project_knowledge',
    'List project knowledge objects organized by category',
    { category: z.string().optional().describe('Filter by category') },
    async ({ category }) => {
      const objects = await categorizer.getAll(category)
      return { content: [{ type: 'text' as const, text: JSON.stringify({ objects }, null, 2) }] }
    },
  )

  server.tool(
    'propose_distillation',
    'Propose distilling a knowledge document into a rule or memory entry',
    {
      knowledgeId: z.string().describe('ID of the knowledge object'),
      targetType: z.enum(['rule', 'memory']).describe('Target type'),
    },
    async ({ knowledgeId, targetType }) => {
      const proposal = await categorizer.proposeDistillation(knowledgeId, targetType)
      return { content: [{ type: 'text' as const, text: JSON.stringify({ proposalId: proposal.id, summary: proposal.summary }) }] }
    },
  )
}
