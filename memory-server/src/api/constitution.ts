import api from './client'
import type { ConstitutionState, SourceFile } from '@/types/constitution'
import type { Proposal } from '@/types/proposal'

export async function fetchConstitution(): Promise<ConstitutionState> {
  const { data } = await api.get('/constitution')
  return data
}

export async function fetchSources(): Promise<{ sources: SourceFile[] }> {
  const { data } = await api.get('/constitution/sources')
  return data
}

export async function runAnalysis(): Promise<ConstitutionState> {
  const { data } = await api.post('/constitution/analyze')
  return data
}

export async function openRuleSource(ruleId: string): Promise<{ opened: boolean; path: string }> {
  const { data } = await api.post('/constitution/open-source', { ruleId })
  return data
}

export async function proposeEdit(params: {
  ruleId: string
  changes: {
    category: import('@/types/constitution').ConstitutionRuleCategory
    normalizedText: string
    scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
    scopeDescription: string
  }
}): Promise<Proposal> {
  const { data } = await api.post('/constitution/propose-edit', params)
  return data
}

export async function proposeCreate(params: {
  title: string
  content: string
  targetFile: string
  insertAfterSection?: string
}): Promise<Proposal> {
  const { data } = await api.post('/constitution/propose-create', params)
  return data
}
