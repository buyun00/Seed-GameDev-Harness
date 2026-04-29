<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useSSE } from '@/composables/useSSE'
import { useAiActivityStore, taskTypeLabel, taskIcon } from '@/stores/aiActivity'
import { fetchTasks } from '@/api/tasks'
import { useI18n } from '@/i18n'
import PageHeader from '@/layouts/PageHeader.vue'

const sse = useSSE()
const store = useAiActivityStore()
const i18n = useI18n()
const logContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)

onMounted(async () => {
  sse.on('agent:log', (data) => store.handleSseEvent('agent:log', data))
  sse.on('task:enqueued', (data) => store.handleSseEvent('task:enqueued', data))
  sse.on('task:progress', (data) => store.handleSseEvent('task:progress', data))
  sse.on('task:complete', (data) => store.handleSseEvent('task:complete', data))
  sse.on('task:failed', (data) => store.handleSseEvent('task:failed', data))
  sse.on('task:cancelled', (data) => store.handleSseEvent('task:cancelled', data))
  sse.connect()

  try {
    const existing = await fetchTasks()
    for (const t of existing) {
      store.upsertTask({
        id: t.id,
        type: t.type,
        status: t.status,
        progress: t.progress,
        error: t.error,
        createdAt: t.createdAt,
      })
    }
  } catch { /* ignore */ }
})

watch(() => store.logs.length, async () => {
  if (autoScroll.value && logContainer.value) {
    await nextTick()
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})

onUnmounted(() => {
  sse.disconnect()
})

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString()
}

function formatElapsed(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  return `${min}m ${sec % 60}s`
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  running: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
  cancelled: '#9ca3af',
}

const sourceColors: Record<string, string> = {
  constitution: '#8b5cf6',
  memory: '#06b6d4',
  knowledge: '#22c55e',
  proposal: '#f59e0b',
  system: '#65686f',
}

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
}
</script>

<template>
  <div class="activity-page">
    <PageHeader :title="'AI Activity'" :subtitle="'Real-time AI task monitoring'" />

    <!-- Active Task -->
    <div class="active-section">
      <div v-if="store.activeTask" class="active-card">
        <div class="active-card__pulse"></div>
        <div class="active-card__body">
          <div class="active-card__top">
            <span class="active-card__icon">{{ taskIcon(store.activeTask.type) }}</span>
            <span class="active-card__type">{{ taskTypeLabel(store.activeTask.type) }}</span>
            <span class="active-card__elapsed">{{ formatElapsed(store.activeTask.createdAt) }}</span>
          </div>
          <div class="active-card__bar">
            <div class="active-card__bar-fill" :style="{ width: (store.activeTask.progressPercent || 30) + '%' }"></div>
          </div>
          <p v-if="store.activeTask.progress" class="active-card__progress">{{ store.activeTask.progress }}</p>
        </div>
      </div>
      <div v-else class="active-idle">
        <span class="active-idle__icon">✓</span>
        <span class="active-idle__text">No active tasks</span>
      </div>
    </div>

    <div class="activity-layout">
      <!-- Recent Tasks -->
      <aside class="tasks-panel">
        <h3 class="panel-title">Recent Tasks</h3>
        <div v-if="store.recentTasks.length === 0" class="panel-empty">No tasks yet</div>
        <div v-else class="tasks-list">
          <div
            v-for="task in store.recentTasks"
            :key="task.id"
            class="task-item"
          >
            <span class="task-item__icon">{{ taskIcon(task.type) }}</span>
            <div class="task-item__body">
              <span class="task-item__type">{{ taskTypeLabel(task.type) }}</span>
              <span class="task-item__meta">{{ formatElapsed(task.createdAt) }} ago</span>
            </div>
            <span
              class="task-item__status"
              :style="{ background: statusColors[task.status] || '#9ca3af' }"
            >{{ task.status }}</span>
          </div>
        </div>
      </aside>

      <!-- Agent Logs -->
      <main class="logs-panel">
        <div class="logs-header">
          <h3 class="panel-title">Agent Logs</h3>
          <div class="logs-header__actions">
            <button class="btn btn--ghost" @click="store.clearLogs()">Clear</button>
            <button
              :class="['btn btn--ghost', { 'btn--active': autoScroll }]"
              @click="toggleAutoScroll"
            >{{ autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF' }}</button>
          </div>
        </div>
        <div ref="logContainer" class="logs-feed" @scroll="autoScroll = false">
          <div v-if="store.logs.length === 0" class="panel-empty">Waiting for activity...</div>
          <div
            v-for="log in store.logs"
            :key="log.id"
            class="log-entry"
          >
            <span class="log-entry__time">{{ formatTime(log.ts) }}</span>
            <span
              class="log-entry__source"
              :style="{ color: sourceColors[log.source] || '#65686f' }"
            >[{{ log.source }}]</span>
            <span class="log-entry__msg">{{ log.message }}</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.activity-page {
  min-height: 100%;
}

/* Active Task */
.active-section {
  padding: 16px 28px;
}
.active-card {
  background: #1c1f26;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}
.active-card__pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
  50% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
}
.active-card__body {
  flex: 1;
}
.active-card__top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.active-card__icon {
  font-size: 18px;
}
.active-card__type {
  font-weight: 600;
  font-size: 15px;
  color: #e8eaed;
}
.active-card__elapsed {
  margin-left: auto;
  font-size: 12px;
  color: #9ca3af;
  font-family: monospace;
}
.active-card__bar {
  height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}
.active-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width 0.5s ease;
}
.active-card__progress {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.active-idle {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.active-idle__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #22c55e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
.active-idle__text {
  font-size: 14px;
  color: #166534;
  font-weight: 500;
}

/* Layout */
.activity-layout {
  display: flex;
  gap: 0;
  padding: 0 28px 28px;
  height: calc(100vh - 220px);
}

/* Tasks Panel */
.tasks-panel {
  width: 280px;
  min-width: 280px;
  padding-right: 20px;
  border-right: 1px solid #e8eaed;
  overflow-y: auto;
}
.panel-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.panel-empty {
  text-align: center;
  padding: 30px 0;
  color: #9ca3af;
  font-size: 13px;
}
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.15s;
}
.task-item:hover {
  background: #f0f1f3;
}
.task-item__icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}
.task-item__body {
  flex: 1;
  min-width: 0;
}
.task-item__type {
  display: block;
  font-weight: 500;
  color: #1c1f26;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-item__meta {
  display: block;
  font-size: 11px;
  color: #9ca3af;
}
.task-item__status {
  font-size: 10px;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: capitalize;
  font-weight: 500;
  white-space: nowrap;
}

/* Logs Panel */
.logs-panel {
  flex: 1;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
}
.logs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.logs-header__actions {
  display: flex;
  gap: 6px;
}
.logs-feed {
  flex: 1;
  overflow-y: auto;
  background: #f7f8fa;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 12px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
}
.log-entry {
  padding: 2px 0;
  display: flex;
  gap: 8px;
}
.log-entry__time {
  color: #9ca3af;
  flex-shrink: 0;
}
.log-entry__source {
  font-weight: 600;
  flex-shrink: 0;
}
.log-entry__msg {
  color: #1c1f26;
  word-break: break-word;
}

.btn {
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  transition: all 0.15s;
}
.btn--ghost {
  border-color: transparent;
  background: transparent;
  color: #65686f;
}
.btn--ghost:hover {
  background: #f0f1f3;
  color: #1c1f26;
}
.btn--active {
  color: #1a5bc7;
  font-weight: 600;
}
</style>
