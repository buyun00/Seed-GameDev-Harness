<script setup lang="ts">
import type { AgentState } from '@/stores/agentStudio'

const props = defineProps<{
  agent: AgentState
}>()

const statusColors: Record<string, string> = {
  idle: '#4b5563',
  working: '#00f5d4',
  waiting: '#f59e0b',
  completed: '#3b82f6',
  error: '#ef4444',
}

const statusLabels: Record<string, string> = {
  idle: '空闲',
  working: '工作中',
  waiting: '等待中',
  completed: '已完成',
  error: '异常',
}

const statusBgColors: Record<string, string> = {
  idle: 'rgba(75,85,99,0.08)',
  working: 'rgba(0,245,212,0.06)',
  waiting: 'rgba(245,158,11,0.08)',
  completed: 'rgba(59,130,246,0.08)',
  error: 'rgba(239,68,68,0.08)',
}

const borderGlows: Record<string, string> = {
  idle: 'rgba(75,85,99,0.15)',
  working: 'rgba(0,245,212,0.3)',
  waiting: 'rgba(245,158,11,0.25)',
  completed: 'rgba(59,130,246,0.25)',
  error: 'rgba(239,68,68,0.25)',
}
</script>

<template>
  <div
    class="workstation"
    :style="{
      borderColor: statusColors[agent.status],
      background: statusBgColors[agent.status],
      boxShadow: `0 0 20px ${borderGlows[agent.status]}`,
    }"
  >
    <div class="workstation__header">
      <div class="workstation__avatar" :style="{ borderColor: statusColors[agent.status] }">
        <span class="workstation__emoji">{{ agent.emoji }}</span>
        <span v-if="agent.status === 'working'" class="workstation__pulse" :style="{ background: statusColors[agent.status] }" />
      </div>
      <div class="workstation__info">
        <span class="workstation__name">{{ agent.name }}</span>
        <span class="workstation__status" :style="{ color: statusColors[agent.status] }">
          <span class="workstation__status-dot" :style="{ background: statusColors[agent.status] }" />
          {{ statusLabels[agent.status] }}
        </span>
      </div>
    </div>
    <div class="workstation__role">{{ agent.role }}</div>
    <div v-if="agent.currentTask" class="workstation__task">
      <span class="workstation__task-icon">▶</span>
      <span class="workstation__task-text">{{ agent.currentTask }}</span>
    </div>
    <div v-if="agent.progress && agent.status === 'working'" class="workstation__progress">
      <div class="workstation__progress-bar" :style="{ background: statusColors[agent.status] }" />
      <span>{{ agent.progress }}</span>
    </div>
  </div>
</template>

<style scoped>
.workstation {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.workstation::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(135deg, transparent 60%, rgba(0, 245, 212, 0.03));
}
.workstation:hover {
  transform: translateY(-2px);
}
.workstation:hover::before {
  opacity: 1;
}
.workstation__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.workstation__avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.3s;
}
.workstation__emoji {
  font-size: 20px;
  line-height: 1;
}
.workstation__pulse {
  position: absolute;
  inset: -3px;
  border-radius: 12px;
  opacity: 0.3;
  animation: avatarPulse 2s ease-in-out infinite;
}
@keyframes avatarPulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.4; }
}
.workstation__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.workstation__name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.workstation__status {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.workstation__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: statusBlink 1.5s ease-in-out infinite;
}
@keyframes statusBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.workstation__role {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.workstation__task {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 6px;
  margin-top: 2px;
  padding: 6px 8px;
  background: var(--card-task-bg);
  border-radius: 6px;
}
.workstation__task-icon {
  color: #00f5d4;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 1px;
}
.workstation__task-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workstation__progress {
  font-size: 11px;
  color: #00f5d4;
  display: flex;
  align-items: center;
  gap: 6px;
}
.workstation__progress-bar {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  animation: progressBlink 0.8s ease-in-out infinite;
}
@keyframes progressBlink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
