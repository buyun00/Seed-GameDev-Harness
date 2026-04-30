import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sendChatMessage } from '@/api/llm'
import { fetchSettings, updateChatHistory } from '@/api/settings'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  const streamingContent = ref('')
  const error = ref('')
  let loaded = false

  async function loadHistory() {
    if (loaded) return
    try {
      const settings = await fetchSettings()
      if (settings.chatHistory?.length) {
        messages.value = settings.chatHistory
      }
    } catch {}
    loaded = true
  }

  function persistHistory() {
    updateChatHistory(messages.value).catch(() => {})
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming.value) return

    error.value = ''
    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }
    messages.value.push(userMsg)

    streaming.value = true
    streamingContent.value = ''

    const history = messages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }))

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }
    messages.value.push(assistantMsg)

    try {
      const fullText = await sendChatMessage(text, history, (chunk) => {
        streamingContent.value += chunk
        messages.value[messages.value.length - 1].content = streamingContent.value
      })
      streamingContent.value = ''
      persistHistory()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      messages.value[messages.value.length - 1].content = `Error: ${error.value}`
    } finally {
      streaming.value = false
    }
  }

  function clearMessages() {
    messages.value = []
    streamingContent.value = ''
    error.value = ''
    persistHistory()
  }

  return { messages, streaming, streamingContent, error, sendMessage, clearMessages, loadHistory }
})
