export type ProposalType =
  | 'constitution_edit'
  | 'constitution_create'
  | 'memory_edit'
  | 'memory_reindex'
  | 'distill_rule'
  | 'distill_memory'
  | 'audit_fix'

export type ProposalStatus = 'pending' | 'approved' | 'applied' | 'rejected'

export interface FileChange {
  path: string
  action: 'modify' | 'create' | 'delete'
  diff: string
  originalContent?: string
  proposedContent?: string
}

export interface Proposal {
  id: string
  type: ProposalType
  source: string
  affectedFiles: FileChange[]
  summary: string
  status: ProposalStatus
  createdAt: string
  appliedAt?: string
}
