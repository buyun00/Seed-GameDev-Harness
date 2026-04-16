import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import type { AppContext } from '../../types.js'
import { hashString } from '../../utils/hash.js'
import { ConstitutionAnalyzer } from '../../analyzers/constitution-analyzer.js'
import { AnchorMatcher } from '../../core/anchor-matcher.js'
import type { ConstitutionAnalysisCache } from '../../models/constitution-rule.js'

export function constitutionRoutes(ctx: AppContext) {
  const router = new Hono()
  const analyzer = new ConstitutionAnalyzer(ctx)

  router.get('/', async (c) => {
    const cached = await ctx.cache.get<ConstitutionAnalysisCache>('constitution-analysis')
    if (!cached) {
      return c.json({ status: 'none', rules: [], sources: [] })
    }

    const freshness = await analyzer.checkFreshness(cached)
    return c.json({
      status: freshness.fresh ? 'up_to_date' : 'outdated',
      analyzedAt: cached.analyzedAt,
      rules: cached.rules,
      relations: cached.relations,
      statusSummary: cached.statusSummary,
      changedFiles: freshness.changedFiles,
    })
  })

  router.get('/sources', async (c) => {
    const sources: Array<{ path: string; content: string; hash: string; exists: boolean }> = []
    const candidates = ['CLAUDE.md', '.claude/CLAUDE.md', 'CLAUDE.local.md']

    for (const rel of candidates) {
      const abs = ctx.projectContext.resolve(rel)
      if (existsSync(abs)) {
        const content = await readFile(abs, 'utf-8')
        sources.push({ path: rel, content, hash: hashString(content), exists: true })
      } else {
        sources.push({ path: rel, content: '', hash: '', exists: false })
      }
    }

    return c.json({ sources })
  })

  router.post('/analyze', async (c) => {
    ctx.sseEmitter.emit('analysis:progress', { step: 'reading_sources', percent: 10 })

    try {
      const result = await analyzer.analyze()
      if (!ctx.taskQueue) {
        await ctx.cache.set('constitution-analysis', result)
        ctx.sseEmitter.emit('analysis:complete', {
          rulesCount: result.rules.length,
          analyzedAt: result.analyzedAt,
        })
      }

      return c.json(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      ctx.sseEmitter.emit('analysis:error', { message, ts: Date.now() })
      return c.json({ error: message }, 500)
    }
  })

  router.post('/propose-edit', async (c) => {
    const body = await c.req.json<{
      ruleId: string
      changes: {
        category: import('../../models/constitution-rule.js').ConstitutionRuleCategory
        normalizedText: string
        scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
        scopeDescription: string
      }
    }>()

    const cached = await ctx.cache.get<ConstitutionAnalysisCache>('constitution-analysis')
    if (!cached) {
      return c.json({ error: 'No analysis available. Run analysis first.' }, 400)
    }

    const rule = cached.rules.find(r => r.id === body.ruleId)
    if (!rule) {
      return c.json({ error: `Rule ${body.ruleId} not found` }, 404)
    }

    const sourceFile = ctx.projectContext.resolve(rule.sourceFile)
    if (!existsSync(sourceFile)) {
      return c.json({ error: `Source file ${rule.sourceFile} not found` }, 404)
    }

    const currentContent = await readFile(sourceFile, 'utf-8')
    const matcher = new AnchorMatcher()
    const matchResult = matcher.match(rule, currentContent)

    if (!matchResult.found) {
      return c.json({ error: 'anchor_mismatch', message: matchResult.reason }, 409)
    }

    try {
      const proposal = await analyzer.proposeEdit(rule, body.changes, cached)
      return c.json(proposal)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Proposal generation failed'
      return c.json({ error: message }, 500)
    }
  })

  router.post('/propose-create', async (c) => {
    const body = await c.req.json<{
      title: string
      content: string
      targetFile: string
      insertAfterSection?: string
    }>()

    try {
      const proposal = await analyzer.proposeCreate(body)
      return c.json(proposal)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Proposal generation failed'
      return c.json({ error: message }, 500)
    }
  })

  router.post('/open-source', async (c) => {
    const body = await c.req.json<{ ruleId: string }>()
    const cached = await ctx.cache.get<ConstitutionAnalysisCache>('constitution-analysis')
    if (!cached) {
      return c.json({ error: 'No analysis available. Run analysis first.' }, 400)
    }

    const rule = cached.rules.find(item => item.id === body.ruleId)
    if (!rule) {
      return c.json({ error: `Rule ${body.ruleId} not found` }, 404)
    }

    const absPath = ctx.projectContext.resolve(rule.sourceFile)
    if (!existsSync(absPath)) {
      return c.json({ error: `Source file ${rule.sourceFile} not found` }, 404)
    }

    try {
      await openPathInDefaultApp(absPath)
      return c.json({ opened: true, path: rule.sourceFile })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open source file'
      return c.json({ error: message }, 500)
    }
  })

  return router
}

async function openPathInDefaultApp(absPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let child

    if (process.platform === 'win32') {
      const escaped = absPath.replace(/'/g, "''")
      child = spawn('powershell.exe', [
        '-NoProfile',
        '-Command',
        `Start-Process -LiteralPath '${escaped}'`,
      ], { detached: true, stdio: 'ignore' })
    } else if (process.platform === 'darwin') {
      child = spawn('open', [absPath], { detached: true, stdio: 'ignore' })
    } else {
      child = spawn('xdg-open', [absPath], { detached: true, stdio: 'ignore' })
    }

    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve()
    })
  })
}
