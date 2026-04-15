import api from './client'
import type { Proposal } from '@/types/proposal'

export async function fetchProposals(): Promise<{ proposals: Proposal[] }> {
  const { data } = await api.get('/proposals')
  return data
}

export async function fetchProposal(id: string): Promise<Proposal> {
  const { data } = await api.get(`/proposals/${id}`)
  return data
}

export async function applyProposal(id: string): Promise<{ applied: boolean; affectedFiles: string[] }> {
  const { data } = await api.post(`/proposals/${id}/apply`)
  return data
}

export async function rejectProposal(id: string): Promise<{ rejected: boolean }> {
  const { data } = await api.post(`/proposals/${id}/reject`)
  return data
}
