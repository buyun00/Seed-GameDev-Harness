import { Hono } from 'hono'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { AppContext } from '../../types.js'
import type { Proposal } from '../../models/proposal.js'

export function proposalRoutes(ctx: AppContext) {
  const router = new Hono()

  router.get('/', async (c) => {
    const dir = ctx.projectContext.proposalsDir
    if (!existsSync(dir)) return c.json({ proposals: [] })

    const files = await readdir(dir)
    const proposals: Proposal[] = []

    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await readFile(join(dir, f), 'utf-8')
        proposals.push(JSON.parse(raw))
      } catch { /* skip */ }
    }

    proposals.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return c.json({ proposals })
  })

  router.get('/:id', async (c) => {
    const id = c.req.param('id')
    const filePath = join(ctx.projectContext.proposalsDir, `${id}.json`)
    if (!existsSync(filePath)) {
      return c.json({ error: 'Proposal not found' }, 404)
    }
    const raw = await readFile(filePath, 'utf-8')
    return c.json(JSON.parse(raw))
  })

  router.post('/:id/apply', async (c) => {
    const id = c.req.param('id')
    const filePath = join(ctx.projectContext.proposalsDir, `${id}.json`)
    if (!existsSync(filePath)) {
      return c.json({ error: 'Proposal not found' }, 404)
    }

    const raw = await readFile(filePath, 'utf-8')
    const proposal: Proposal = JSON.parse(raw)

    if (proposal.status !== 'pending') {
      return c.json({ error: `Proposal is ${proposal.status}, cannot apply` }, 400)
    }

    const appliedFiles: string[] = []

    for (const change of proposal.affectedFiles) {
      const absPath = ctx.projectContext.resolve(change.path)
      if (change.action === 'modify' && change.proposedContent != null) {
        await ctx.writer.write(absPath, change.proposedContent)
        appliedFiles.push(change.path)
      } else if (change.action === 'create' && change.proposedContent != null) {
        await ctx.writer.write(absPath, change.proposedContent)
        appliedFiles.push(change.path)
      }
    }

    proposal.status = 'applied'
    proposal.appliedAt = new Date().toISOString()
    await ctx.writer.write(filePath, JSON.stringify(proposal, null, 2))

    ctx.sseEmitter.emit('proposal:applied', { id, appliedFiles })
    await ctx.scanner.scan()

    return c.json({ applied: true, affectedFiles: appliedFiles })
  })

  router.post('/:id/reject', async (c) => {
    const id = c.req.param('id')
    const filePath = join(ctx.projectContext.proposalsDir, `${id}.json`)
    if (!existsSync(filePath)) {
      return c.json({ error: 'Proposal not found' }, 404)
    }

    const raw = await readFile(filePath, 'utf-8')
    const proposal: Proposal = JSON.parse(raw)
    proposal.status = 'rejected'
    await ctx.writer.write(filePath, JSON.stringify(proposal, null, 2))

    return c.json({ rejected: true })
  })

  return router
}
