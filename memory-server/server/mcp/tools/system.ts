import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AppContext } from '../../types.js'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export function registerSystemTools(server: McpServer, ctx: AppContext) {
  server.tool(
    'list_knowledge_assets',
    'List all knowledge assets across all layers',
    {
      layer: z.enum(['constitution', 'memory', 'knowledge']).optional().describe('Filter by layer'),
      status: z.string().optional().describe('Filter by status'),
    },
    async ({ layer, status }) => {
      let assets = ctx.scanner.getAll()
      if (layer) assets = assets.filter(a => a.kind === layer)
      if (status) assets = assets.filter(a => a.status === status)
      return { content: [{ type: 'text' as const, text: JSON.stringify({ assets }, null, 2) }] }
    },
  )

  server.tool(
    'read_knowledge_asset',
    'Read the content of a knowledge asset',
    { assetId: z.string().describe('ID of the asset') },
    async ({ assetId }) => {
      const asset = ctx.scanner.getById(assetId)
      if (!asset) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Asset not found' }) }] }
      }
      const absPath = ctx.projectContext.resolve(asset.sourcePath)
      if (!existsSync(absPath)) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'File not found' }) }] }
      }
      const content = await readFile(absPath, 'utf-8')
      return { content: [{ type: 'text' as const, text: JSON.stringify({ asset, content }, null, 2) }] }
    },
  )

  server.tool(
    'audit_knowledge_system',
    'Audit the knowledge system for issues like stale rules, duplicates, or conflicts',
    {},
    async () => {
      const issues: Array<{ type: string; severity: string; message: string; path?: string }> = []
      const assets = ctx.scanner.getAll()

      const constitutionAssets = assets.filter(a => a.kind === 'constitution')
      if (constitutionAssets.length === 0) {
        issues.push({ type: 'missing', severity: 'warning', message: 'No CLAUDE.md files found' })
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify({ issues }, null, 2) }] }
    },
  )

  server.tool(
    'open_memory_manager_ui',
    'Get the URL to open the Memory Editor web UI',
    {},
    async () => {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ url: `Open the Memory Editor UI in your browser. The URL was printed at server startup.` }) }] }
    },
  )
}
