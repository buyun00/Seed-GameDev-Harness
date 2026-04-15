import api from './client'
import type { KnowledgeObject } from '@/types/knowledge'
import type { Proposal } from '@/types/proposal'

export async function fetchProjectKnowledge(category?: string): Promise<{ objects: KnowledgeObject[] }> {
  const params = category ? { category } : {}
  const { data } = await api.get('/project-knowledge', { params })
  return data
}

export async function fetchKnowledgeObject(id: string): Promise<KnowledgeObject> {
  const { data } = await api.get(`/project-knowledge/${id}`)
  return data
}

export async function proposeDistill(knowledgeId: string, targetType: 'rule' | 'memory'): Promise<Proposal> {
  const { data } = await api.post('/project-knowledge/distill', { knowledgeId, targetType })
  return data
}
