export type ConstitutionRuleCategory =
  | 'language_output'
  | 'core_principles'
  | 'agent_collaboration'
  | 'tools_commands'
  | 'escalation_decision'
  | 'memory_context'
  | 'activation_conditions'
  | 'safety_constraints'
  | 'other'

export const RULE_CATEGORY_ORDER: ConstitutionRuleCategory[] = [
  'language_output',
  'core_principles',
  'agent_collaboration',
  'tools_commands',
  'escalation_decision',
  'memory_context',
  'activation_conditions',
  'safety_constraints',
  'other',
]

export const RULE_CATEGORY_LABELS: Record<ConstitutionRuleCategory, string> = {
  language_output: '语言与输出',
  core_principles: '核心原则',
  agent_collaboration: 'Agent/团队协作',
  tools_commands: '工具与命令',
  escalation_decision: '升级与决策',
  memory_context: '记忆与上下文',
  activation_conditions: '激活条件',
  safety_constraints: '安全限制',
  other: '其他',
}

export interface ConstitutionRule {
  id: string
  title: string
  category: ConstitutionRuleCategory
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
