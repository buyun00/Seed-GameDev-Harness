import api from './client'
import type { AgentState } from '@/stores/agentStudio'

export async function fetchAgents(): Promise<AgentState[]> {
  const { data } = await api.get('/agents')
  return data.agents
}

export async function fetchAgent(id: string): Promise<AgentState> {
  const { data } = await api.get(`/agents/${id}`)
  return data.agent
}
