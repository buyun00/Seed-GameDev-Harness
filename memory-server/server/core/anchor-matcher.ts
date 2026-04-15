import type { ConstitutionRule } from '../models/constitution-rule.js'

export interface MatchResult {
  found: boolean
  offset?: number
  line?: number
  reason?: string
  shifted?: boolean
}

export class AnchorMatcher {
  match(rule: ConstitutionRule, currentContent: string): MatchResult {
    const exactResult = this.exactMatch(rule, currentContent)
    if (exactResult.found) return exactResult

    const fuzzyResult = this.fuzzyMatch(rule, currentContent)
    if (fuzzyResult.found) return fuzzyResult

    return {
      found: false,
      reason: 'Source file has been modified since last analysis. Re-run analysis to update.',
    }
  }

  private exactMatch(rule: ConstitutionRule, content: string): MatchResult {
    const excerpt = rule.originalExcerpt.trim()
    if (!excerpt) return { found: false }

    const idx = content.indexOf(excerpt)
    if (idx === -1) return { found: false }

    const line = content.slice(0, idx).split('\n').length
    const shift = Math.abs(line - rule.sourceSpan.startLine)

    return {
      found: true,
      offset: idx,
      line,
      shifted: shift > 5,
    }
  }

  private fuzzyMatch(rule: ConstitutionRule, content: string): MatchResult {
    const { before, after, sectionHeading } = rule.contextAnchor

    if (sectionHeading) {
      const headingIdx = content.indexOf(sectionHeading)
      if (headingIdx !== -1) {
        const line = content.slice(0, headingIdx).split('\n').length
        return { found: true, offset: headingIdx, line, shifted: true }
      }
    }

    if (before) {
      const trimmed = before.trim()
      const idx = content.indexOf(trimmed)
      if (idx !== -1) {
        const afterIdx = idx + trimmed.length
        const line = content.slice(0, afterIdx).split('\n').length
        return { found: true, offset: afterIdx, line, shifted: true }
      }
    }

    if (after) {
      const trimmed = after.trim()
      const idx = content.indexOf(trimmed)
      if (idx !== -1) {
        const line = content.slice(0, idx).split('\n').length
        return { found: true, offset: idx, line, shifted: true }
      }
    }

    return { found: false }
  }
}
