export type KnowledgeCategory =
  | 'rules'
  | 'project_knowledge'
  | 'public_interfaces'
  | 'code_standards'
  | 'architecture'
  | 'research'
  | 'runbooks'
  | 'uncategorized'

export interface KnowledgeObject {
  id: string
  title: string
  category: KnowledgeCategory
  summary: string
  sourcePath: string
  tags: string[]
  status: 'active' | 'stale' | 'reference_only'
  layerAffinity: 'affects_constitution' | 'candidate_for_memory' | 'reference_only'
  updatedAt: string
  content?: string
}
