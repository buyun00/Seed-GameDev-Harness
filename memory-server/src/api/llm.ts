import api from './client'

export interface LlmConfig {
  key: string
  provider: string
  apiKey: string
  model: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}

export interface LlmConfigList {
  configs: Array<{ key: string; config: LlmConfig }>
  activeKey: string
}

export async function fetchLlmConfigs(): Promise<LlmConfigList> {
  const { data } = await api.get('/llm/config')
  return data
}

export async function saveLlmConfig(config: {
  key: string
  provider: string
  apiKey: string
  model?: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}): Promise<void> {
  await api.post('/llm/config', config)
}

export async function activateLlmConfig(key: string): Promise<void> {
  await api.put(`/llm/config/${encodeURIComponent(key)}/activate`)
}

export async function deleteLlmConfig(key: string): Promise<void> {
  await api.delete(`/llm/config/${encodeURIComponent(key)}`)
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch('/api/llm/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Chat error (${response.status}): ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        if (parsed.text) {
          fullText += parsed.text
          onChunk(parsed.text)
        } else if (parsed.error) {
          throw new Error(parsed.error)
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }

  return fullText
}
