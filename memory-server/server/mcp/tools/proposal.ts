import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AppContext } from '../../types.js'
import type { Proposal } from '../../models/proposal.js'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export function registerProposalTools(server: McpServer, ctx: AppContext) {
  server.tool(
    'apply_proposal',
    'Apply a pending proposal to write changes to files',
    { proposalId: z.string().describe('ID of the proposal to apply') },
    async ({ proposalId }) => {
      const filePath = join(ctx.projectContext.proposalsDir, `${proposalId}.json`)
      if (!existsSync(filePath)) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Proposal not found' }) }] }
      }

      const raw = await readFile(filePath, 'utf-8')
      const proposal: Proposal = JSON.parse(raw)

      if (proposal.status !== 'pending') {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Proposal is ${proposal.status}` }) }] }
      }

      const appliedFiles: string[] = []
      for (const change of proposal.affectedFiles) {
        const absPath = ctx.projectContext.resolve(change.path)
        if (change.proposedContent != null) {
          await ctx.writer.write(absPath, change.proposedContent)
          appliedFiles.push(change.path)
        }
      }

      proposal.status = 'applied'
      proposal.appliedAt = new Date().toISOString()
      await ctx.writer.write(filePath, JSON.stringify(proposal, null, 2))

      ctx.sseEmitter.emit('proposal:applied', { id: proposalId, appliedFiles })
      await ctx.scanner.scan()

      return { content: [{ type: 'text' as const, text: JSON.stringify({ applied: true, affectedFiles: appliedFiles }) }] }
    },
  )
}
