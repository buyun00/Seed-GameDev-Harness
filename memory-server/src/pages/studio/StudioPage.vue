<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAgentStudioStore } from '@/stores/agentStudio'
import { useChatStore } from '@/stores/chat'
import { useI18n } from '@/i18n'
import { fetchLlmConfigs } from '@/api/llm'
import ProviderIcon from '@/components/common/ProviderIcon.vue'
import AgentWorkstation from './AgentWorkstation.vue'
import ChatPanel from './ChatPanel.vue'
import ApiKeySettings from './ApiKeySettings.vue'

const agentStore = useAgentStudioStore()
const chatStore = useChatStore()
const i18n = useI18n()
const showApiKeySettings = ref(false)
const sseConnected = ref(false)
const agentCollapsed = ref(false)
const activeModelName = ref('')
const activeModelProvider = ref('')

async function loadActiveModel() {
  try {
    const data = await fetchLlmConfigs()
    const active = data.configs.find(c => c.key === data.activeKey)
    if (active) {
      activeModelName.value = active.config.model
      activeModelProvider.value = active.config.provider
    } else {
      activeModelName.value = ''
      activeModelProvider.value = ''
    }
  } catch {}
}

function onConfigChanged() {
  loadActiveModel()
}

let eventSource: EventSource | null = null

function connectSSE() {
  const es = new EventSource('/api/events')
  eventSource = es

  es.addEventListener('agent:status_changed', (event) => {
    try {
      const data = JSON.parse(event.data)
      agentStore.updateAgentFromSSE(data)
    } catch {}
  })

  es.addEventListener('open', () => {
    sseConnected.value = true
  })

  es.addEventListener('error', () => {
    sseConnected.value = false
    setTimeout(() => {
      if (eventSource === es) connectSSE()
    }, 3000)
  })
}

onMounted(async () => {
  await agentStore.refreshAgents()
  chatStore.loadHistory()
  loadActiveModel()
  connectSSE()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})
</script>

<template>
  <div class="studio">
    <div class="studio__bg" />
    <div class="studio__content">
      <div class="studio__top-bar">
        <div class="studio__title-group">
          <h2 class="studio__title">{{ i18n.studioTitle }}</h2>
          <span class="studio__subtitle">{{ i18n.studioSubtitle }}</span>
        </div>
        <div class="studio__top-actions">
          <span class="studio__sse-status" :class="{ 'studio__sse-status--connected': sseConnected }">
            <span class="studio__sse-dot" />
            {{ sseConnected ? i18n.studioConnected : i18n.studioDisconnected }}
          </span>
          <button class="studio__settings-btn" @click="showApiKeySettings = true">
            <span class="studio__settings-icon">⚙</span>
            {{ i18n.studioApiSettings }}
            <span v-if="activeModelName" class="studio__model-badge">
               <ProviderIcon :provider="activeModelProvider" :size="14" />
               {{ activeModelName }}
             </span>
          </button>
        </div>
      </div>

      <div class="studio__agents" :class="{ 'studio__agents--collapsed': agentCollapsed }">
        <div class="studio__section-header studio__section-header--clickable" @click="agentCollapsed = !agentCollapsed">
          <h3 class="studio__section-title">
            <span class="studio__section-icon">🤖</span>
            {{ i18n.studioAgentTeam }}
            <span class="studio__collapse-icon">{{ agentCollapsed ? '▶' : '▼' }}</span>
          </h3>
          <span class="studio__section-count">{{ agentStore.agents.length }} {{ i18n.studioAgentCount }}</span>
        </div>
        <transition name="collapse">
          <div v-show="!agentCollapsed" class="studio__agent-strip">
            <AgentWorkstation
              v-for="agent in agentStore.agents"
              :key="agent.id"
              :agent="agent"
            />
          </div>
        </transition>
      </div>

      <div class="studio__chat">
        <ChatPanel />
      </div>
    </div>

    <ApiKeySettings
      v-if="showApiKeySettings"
      @close="showApiKeySettings = false"
      @config-changed="onConfigChanged"
    />
  </div>
</template>

<style scoped>
.studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}
.studio__bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(0, 245, 212, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(124, 58, 237, 0.03) 0%, transparent 50%);
}
.studio__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 24px;
  gap: 12px;
  overflow: hidden;
}
.studio__top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.studio__title-group {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.studio__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}
.studio__subtitle {
  font-size: 13px;
  color: var(--text-muted);
}
.studio__top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.studio__sse-status {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
.studio__sse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
}
.studio__sse-status--connected {
  color: var(--accent-cyan);
}
.studio__sse-status--connected .studio__sse-dot {
  background: var(--accent-cyan);
  box-shadow: 0 0 6px var(--accent-cyan);
  animation: ssePulse 2s ease-in-out infinite;
}
@keyframes ssePulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.studio__settings-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(124, 58, 237, 0.1));
  color: var(--text-primary);
  border: 1px solid var(--border-visible);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.studio__settings-btn:hover {
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(124, 58, 237, 0.2));
  border-color: var(--accent-cyan);
}
.studio__settings-icon {
  font-size: 14px;
}
.studio__model-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 245, 212, 0.12);
  color: var(--accent-cyan);
  font-weight: 500;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* Agent section - collapsible */
.studio__agents {
  flex-shrink: 0;
  overflow: hidden;
}
.studio__agents--collapsed {
  flex-shrink: 0;
}
.studio__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.studio__section-header--clickable {
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  border-radius: 6px;
  transition: background 0.15s;
}
.studio__section-header--clickable:hover {
  background: var(--border-color);
}
.studio__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.studio__section-icon {
  font-size: 14px;
}
.studio__collapse-icon {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s;
}
.studio__section-count {
  font-size: 12px;
  color: var(--text-muted);
}
.studio__agent-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.studio__agent-strip > :deep(.workstation) {
  min-width: 200px;
  flex-shrink: 0;
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 120px;
}

/* Chat section - waterfall full height */
.studio__chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-surface);
  backdrop-filter: blur(12px);
}
</style>
