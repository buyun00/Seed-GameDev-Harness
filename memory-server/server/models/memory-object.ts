export type MemoryType = 'user' | 'feedback' | 'project' | 'reference'
export type MemoryStatus = 'indexed' | 'unindexed' | 'stale' | 'duplicate' | 'recently_used'

export interface MemoryObject {
  id: string
  title: string
  description: string
  type: MemoryType
  sourcePath: string
  indexed: boolean
  indexEntry?: string
  status: MemoryStatus
  updatedAt: string
  content: string
  frontmatter?: Record<string, unknown>
}
