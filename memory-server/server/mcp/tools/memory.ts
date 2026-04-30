import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AppContext } from '../../types.js'
import { MemoryPathResolver } from '../../core/memory-path-resolver.js'
import { MemoryAnalyzer } from '../../analyzers/memory-analyzer.js'

export function registerMemoryTools(server: McpServer, ctx: AppContext) {
  const pathResolver = new MemoryPathResolver(ctx.projectContext)
  const analyzer = new MemoryAnalyzer(ctx, pathResolver)

  server.tool(
    'list_memory_objects',
    'List auto memory objects with their index and status',
    {
      type: z.string().optional().describe('Filter by type'),
      status: z.string().optional().describe('Filter by status'),
    },
    async ({ type, status }) => {
      const result = await analyzer.scan()
      let objects = result.objects
      if (type) objects = objects.filter(o => o.type === type)
      if (status) objects = objects.filter(o => o.status === status)
      return { content: [{ type: 'text' as const, text: JSON.stringify({ ...result, objects }, null, 2) }] }
    },
  )

  server.tool(
    'propose_memory_edit',
    'Propose edits to a memory object',
    {
      memoryId: z.string().describe('ID of the memory object'),
      changes: z.record(z.string(), z.unknown()).describe('Changes to apply'),
    },
    async ({ memoryId, changes }) => {
      const proposal = await analyzer.proposeEdit(memoryId, changes)
      return { content: [{ type: 'text' as const, text: JSON.stringify({ proposalId: proposal.id, summary: proposal.summary }) }] }
    },
  )

  server.tool(
    'reindex_memory',
    'Check and report unindexed memory files',
    {},
    async () => {
      const result = await analyzer.reindex()
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )
}
