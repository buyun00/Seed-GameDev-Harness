<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

marked.setOptions({
  breaks: true,
  gfm: true,
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

async function handleSend() {
  const text = inputText.value
  if (!text.trim() || chatStore.streaming) return

  inputText.value = ''
  await chatStore.sendMessage(text)

  await nextTick()
  scrollToBottom()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-panel">
    <div ref="messagesContainer" class="chat-panel__messages">
      <div v-if="chatStore.messages.length === 0" class="chat-panel__empty">
        <div class="chat-panel__empty-icon">💬</div>
        <p class="chat-panel__empty-title">开始与 AI 对话</p>
        <p class="chat-panel__empty-hint">输入你的问题，AI 助手将为你解答</p>
      </div>
      <div
        v-for="(msg, idx) in chatStore.messages"
        :key="idx"
        :class="['chat-panel__row', `chat-panel__row--${msg.role}`]"
      >
        <div class="chat-panel__bubble">
          <div class="chat-panel__bubble-header">
            <span class="chat-panel__bubble-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
            <span class="chat-panel__bubble-role">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
            <span class="chat-panel__bubble-time">{{ new Date(msg.timestamp).toLocaleTimeString() }}</span>
          </div>
          <div
            class="chat-panel__bubble-text chat-panel__bubble-text--md"
            v-html="renderMarkdown(msg.content)"
          />
          <div v-if="idx === chatStore.messages.length - 1 && chatStore.streaming" class="chat-panel__cursor" />
        </div>
      </div>
    </div>
    <div v-if="chatStore.error" class="chat-panel__error">
      <span class="chat-panel__error-icon">!</span>
      {{ chatStore.error }}
    </div>
    <div class="chat-panel__input-area">
      <textarea
        v-model="inputText"
        class="chat-panel__input"
        placeholder="输入消息..."
        :disabled="chatStore.streaming"
        @keydown="handleKeydown"
        rows="1"
      />
      <button
        class="chat-panel__send"
        :disabled="!inputText.trim() || chatStore.streaming"
        @click="handleSend"
      >
        {{ chatStore.streaming ? '...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}
.chat-panel__empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
.chat-panel__empty-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
}
.chat-panel__empty-hint {
  font-size: 13px;
  color: var(--text-muted);
}
.chat-panel__row {
  display: flex;
  animation: msgSlide 0.25s ease;
}
.chat-panel__row--user {
  justify-content: flex-end;
}
.chat-panel__row--assistant {
  justify-content: flex-start;
}
@keyframes msgSlide {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.chat-panel__bubble {
  max-width: 76%;
  min-width: 200px;
}
.chat-panel__bubble-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.chat-panel__row--user .chat-panel__bubble-header {
  flex-direction: row-reverse;
}
.chat-panel__bubble-avatar {
  font-size: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-panel__bubble-role {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}
.chat-panel__bubble-time {
  font-size: 11px;
  color: var(--text-muted);
}
.chat-panel__row--user .chat-panel__bubble-role {
  color: var(--accent-cyan);
}
.chat-panel__bubble-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.chat-panel__row--assistant .chat-panel__bubble-text {
  background: var(--chat-ai-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-top-left-radius: 2px;
}
.chat-panel__row--user .chat-panel__bubble-text {
  background: var(--chat-user-bg);
  border: 1px solid rgba(0, 245, 212, 0.15);
  color: var(--text-primary);
  border-top-right-radius: 2px;
}
.chat-panel__cursor {
  display: inline-block;
  width: 2px;
  height: 18px;
  background: var(--accent-cyan);
  animation: blink 0.8s step-end infinite;
  margin-left: 16px;
  margin-top: 4px;
  box-shadow: 0 0 4px var(--accent-cyan);
}
@keyframes blink {
  50% { opacity: 0; }
}
.chat-panel__error {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  font-size: 13px;
  border-top: 1px solid rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  gap: 6px;
}
.chat-panel__error-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}
.chat-panel__input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface);
}
.chat-panel__input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s;
  line-height: 1.5;
  max-height: 120px;
}
.chat-panel__input::placeholder {
  color: var(--text-muted);
}
.chat-panel__input:focus {
  border-color: var(--accent-cyan);
}
.chat-panel__send {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--accent-cyan), #00c9a7);
  color: #0a0a0f;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-end;
  font-weight: 600;
  transition: all 0.2s;
}
.chat-panel__send:hover:not(:disabled) {
  box-shadow: 0 0 16px rgba(0, 245, 212, 0.3);
  transform: translateY(-1px);
}
.chat-panel__send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Markdown rendered content styles */
.chat-panel__bubble-text--md :deep(p) {
  margin-bottom: 8px;
}
.chat-panel__bubble-text--md :deep(p:last-child) {
  margin-bottom: 0;
}
.chat-panel__bubble-text--md :deep(h1),
.chat-panel__bubble-text--md :deep(h2),
.chat-panel__bubble-text--md :deep(h3),
.chat-panel__bubble-text--md :deep(h4) {
  margin: 12px 0 6px;
  font-weight: 600;
  line-height: 1.4;
}
.chat-panel__bubble-text--md :deep(h1) { font-size: 18px; }
.chat-panel__bubble-text--md :deep(h2) { font-size: 16px; }
.chat-panel__bubble-text--md :deep(h3) { font-size: 15px; }
.chat-panel__bubble-text--md :deep(h4) { font-size: 14px; }
.chat-panel__bubble-text--md :deep(ul),
.chat-panel__bubble-text--md :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}
.chat-panel__bubble-text--md :deep(li) {
  margin-bottom: 4px;
}
.chat-panel__bubble-text--md :deep(li:last-child) {
  margin-bottom: 0;
}
.chat-panel__bubble-text--md :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent-cyan);
}
.chat-panel__bubble-text--md :deep(pre) {
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
}
.chat-panel__bubble-text--md :deep(pre code) {
  display: block;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.25);
  color: #e8eaed;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  border-radius: 0;
}
.chat-panel__bubble-text--md :deep(blockquote) {
  border-left: 3px solid var(--accent-cyan);
  padding: 4px 0 4px 12px;
  margin: 8px 0;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0 4px 4px 0;
}
.chat-panel__bubble-text--md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 13px;
}
.chat-panel__bubble-text--md :deep(th),
.chat-panel__bubble-text--md :deep(td) {
  border: 1px solid var(--border-color);
  padding: 6px 10px;
  text-align: left;
}
.chat-panel__bubble-text--md :deep(th) {
  background: rgba(0, 0, 0, 0.1);
  font-weight: 600;
}
.chat-panel__bubble-text--md :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 12px 0;
}
.chat-panel__bubble-text--md :deep(a) {
  color: var(--accent-cyan);
  text-decoration: none;
}
.chat-panel__bubble-text--md :deep(a:hover) {
  text-decoration: underline;
}
.chat-panel__bubble-text--md :deep(strong) {
  font-weight: 600;
}
.chat-panel__bubble-text--md :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  margin: 4px 0;
}
</style>
