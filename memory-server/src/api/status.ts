import api from './client'
import type { ApiStatus } from '@/types/api'

export async function fetchStatus(): Promise<ApiStatus> {
  const { data } = await api.get('/status')
  return data
}

export async function updateLanguage(language: string): Promise<void> {
  await api.put('/settings/language', { language })
}
