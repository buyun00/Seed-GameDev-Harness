import api from './client'

export interface BackendSettings {
  language: string
  theme: string
  activeApiKey: string
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

export async function fetchSettings(): Promise<BackendSettings> {
  const { data } = await api.get('/settings')
  return data
}

export async function updateSettingLanguage(language: string): Promise<void> {
  await api.put('/settings/language', { language })
}

export async function updateSettingTheme(theme: string): Promise<void> {
  await api.put('/settings/theme', { theme })
}

export async function updateChatHistory(history: Array<{ role: string; content: string; timestamp: string }>): Promise<void> {
  await api.put('/settings/chat-history', { history })
}
