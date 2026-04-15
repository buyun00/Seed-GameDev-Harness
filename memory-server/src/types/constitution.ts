export interface ConstitutionRule {
  id: string
  title: string
  normalizedText: string
  originalExcerpt: string
  sourceFile: string
  sourceSpan: {
    startLine: number
    endLine: number
    startOffset: number
    endOffset: number
  }
  contextAnchor: {
    before: string
    after: string
    sectionHeading?: string
  }
  writebackStrategy: 'replace' | 'insert_after' | 'append_to_section'
  status: 'effective' | 'shadowed' | 'conflicting' | 'unresolved'
  confidence: number
  relations: Relation[]
  scope?: string
}

export interface Relation {
  type: string
  targetRuleId: string
  description: string
}

export type AnalysisStatus = 'none' | 'up_to_date' | 'outdated'

export interface ConstitutionState {
  status: AnalysisStatus
  analyzedAt?: string
  rules: ConstitutionRule[]
  statusSummary?: {
    effective: number
    shadowed: number
    conflicting: number
    unresolved: number
    total: number
  }
  changedFiles?: string[]
}

export interface SourceFile {
  path: string
  content: string
  hash: string
  exists: boolean
}
