import api from './client'

export interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  params: unknown
  result?: unknown
  error?: string
  progress?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export async function fetchTasks(filter?: { type?: string; status?: string }): Promise<Task[]> {
  const params = new URLSearchParams()
  if (filter?.type) params.set('type', filter.type)
  if (filter?.status) params.set('status', filter.status)
  const { data } = await api.get(`/tasks?${params}`)
  return data.tasks
}

export async function fetchTask(id: string): Promise<Task> {
  const { data } = await api.get(`/tasks/${id}`)
  return data
}

export async function cancelTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
