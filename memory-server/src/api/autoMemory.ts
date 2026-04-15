import api from './client'
import type { MemoryScanResult, MemoryObject } from '@/types/memory'
import type { Proposal } from '@/types/proposal'

export async function fetchAutoMemory(): Promise<MemoryScanResult> {
  const { data } = await api.get('/auto-memory')
  return data
}

export async function fetchMemoryObject(id: string): Promise<MemoryObject> {
  const { data } = await api.get(`/auto-memory/${id}`)
  return data
}

export async function proposeMemoryEdit(memoryId: string, changes: Record<string, unknown>): Promise<Proposal> {
  const { data } = await api.post('/auto-memory/propose-edit', { memoryId, changes })
  return data
}

export async function reindexMemory(): Promise<{ indexed: number; unindexed: number; actions: string[] }> {
  const { data } = await api.post('/auto-memory/reindex')
  return data
}
