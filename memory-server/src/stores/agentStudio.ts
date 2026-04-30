import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAgents } from '@/api/agents'

export interface AgentState {
  id: string
  name: string
  role: string
  status: 'idle' | 'working' | 'waiting' | 'completed' | 'error'
  currentTask: string
  progress: string
  startedAt: string | null
  updatedAt: string
  emoji: string
}

export const useAgentStudioStore = defineStore('agentStudio', () => {
  const agents = ref<AgentState[]>([])
  const loading = ref(false)

  async function refreshAgents() {
    loading.value = true
    try {
      agents.value = await fetchAgents()
    } catch {
    } finally {
      loading.value = false
    }
  }

  function updateAgentFromSSE(data: { agent: AgentState }) {
    const idx = agents.value.findIndex(a => a.id === data.agent.id)
    if (idx !== -1) {
      agents.value[idx] = data.agent
    } else {
      agents.value.push(data.agent)
    }
  }

  return { agents, loading, refreshAgents, updateAgentFromSSE }
})
