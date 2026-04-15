export interface FileChange {
  path: string
  action: 'modify' | 'create' | 'delete'
  diff: string
  originalContent?: string
  proposedContent?: string
}

export interface Proposal {
  id: string
  type: string
  source: string
  affectedFiles: FileChange[]
  summary: string
  status: 'pending' | 'approved' | 'applied' | 'rejected'
  createdAt: string
  appliedAt?: string
}
