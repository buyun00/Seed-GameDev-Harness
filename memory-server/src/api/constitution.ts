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

export async function proposeEdit(params: {
  ruleId: string
  changes: { title?: string; normalizedText?: string }
  editIntent: string
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
