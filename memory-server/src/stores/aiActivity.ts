import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ActivityLog {
  id: number
  source: string
  message: string
  ts: number
}

export interface ActivityTask {
  id: string
  type: string
  status: string
  progress?: string
  progressPercent?: number
  error?: string
  createdAt: string
}

const TASK_LABELS: Record<string, string> = {
  constitution_analysis: 'Constitution Analysis',
  proposal_generation: 'Proposal Generation',
  proposal_create: 'Proposal Create',
  memory_analysis: 'Memory Analysis',
  knowledge_distill: 'Knowledge Distillation',
}

export function taskTypeLabel(type: string): string {
  return TASK_LABELS[type] || type.replace(/_/g, ' ')
}

export function taskIcon(type: string): string {
  if (type.startsWith('constitution')) return '⚖'
  if (type.startsWith('proposal')) return '📝'
  if (type.startsWith('memory')) return '🧠'
  if (type.startsWith('knowledge')) return '📚'
  return '⚙'
}

export const useAiActivityStore = defineStore('aiActivity', () => {
  const logs = ref<ActivityLog[]>([])
  const tasks = ref<Map<string, ActivityTask>>(new Map())
  const connected = ref(false)

  let nextLogId = 0

  const activeTask = computed(() => {
    for (const task of tasks.value.values()) {
      if (task.status === 'running') return task
    }
    return null
  })

  const recentTasks = computed(() => {
    return Array.from(tasks.value.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50)
  })

  function addLog(source: string, message: string, ts: number) {
    logs.value.push({ id: nextLogId++, source, message, ts })
    if (logs.value.length > 500) {
      logs.value.splice(0, logs.value.length - 500)
    }
  }

  function upsertTask(task: ActivityTask) {
    tasks.value.set(task.id, task)
  }

  function handleSseEvent(type: string, data: Record<string, unknown>) {
    if (type === 'agent:log') {
      addLog(
        (data.source as string) || 'unknown',
        (data.message as string) || '',
        (data.ts as number) || Date.now(),
      )
      return
    }

    if (type.startsWith('task:')) {
      if (!data.taskId || !data.type || !data.status) {
        console.warn('Invalid task event:', data)
        return
      }

      const progressPercent =
        type === 'task:enqueued' ? 5
        : type === 'task:progress' ? 50
        : type === 'task:complete' ? 100
        : type === 'task:failed' ? 100
        : type === 'task:cancelled' ? 100
        : undefined

      upsertTask({
        id: data.taskId as string,
        type: data.type as string,
        status: data.status as string,
        progress: data.progress as string,
        progressPercent,
        error: data.error as string,
        createdAt: (data.createdAt as string) || new Date().toISOString(),
      })
    }

    if (type === 'task:enqueued') {
      addLog('system', `Task queued: ${taskTypeLabel((data.type as string) || '')}`, Date.now())
    }
    if (type === 'task:complete') {
      addLog('system', `Task completed: ${taskTypeLabel((data.type as string) || '')}`, Date.now())
    }
    if (type === 'task:failed') {
      addLog('system', `Task failed: ${taskTypeLabel((data.type as string) || '')}${data.error ? ` — ${data.error}` : ''}`, Date.now())
    }
  }

  function clearLogs() {
    logs.value = []
  }

  function clearTasks() {
    tasks.value.clear()
  }

  return {
    logs, tasks, connected, activeTask, recentTasks,
    addLog, upsertTask, handleSseEvent, clearLogs, clearTasks,
  }
})
