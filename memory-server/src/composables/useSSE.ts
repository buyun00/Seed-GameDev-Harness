import { ref, onUnmounted } from 'vue'

type EventHandler = (data: Record<string, unknown>) => void

export function useSSE() {
  const connected = ref(false)
  const handlers = new Map<string, Set<EventHandler>>()
  let source: EventSource | null = null

  function connect() {
    if (source) return
    source = new EventSource('/api/events')

    source.onopen = () => {
      connected.value = true
    }

    source.onerror = () => {
      connected.value = false
      source?.close()
      source = null
      setTimeout(connect, 3000)
    }

    const eventTypes = [
      'file:changed',
      'analysis:progress',
      'analysis:complete',
      'agent:log',
      'proposal:created',
      'proposal:applied',
      'scan:updated',
      'task:enqueued',
      'task:progress',
      'task:complete',
      'task:failed',
      'task:cancelled',
    ]

    for (const type of eventTypes) {
      source.addEventListener(type, (e) => {
        const data = JSON.parse((e as MessageEvent).data)
        const set = handlers.get(type)
        if (set) {
          for (const handler of set) {
            try { handler(data) } catch { /* ignore */ }
          }
        }
      })
    }
  }

  function on(type: string, handler: EventHandler) {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type)!.add(handler)
  }

  function off(type: string, handler: EventHandler) {
    handlers.get(type)?.delete(handler)
  }

  function disconnect() {
    source?.close()
    source = null
    connected.value = false
  }

  onUnmounted(disconnect)

  return { connected, connect, disconnect, on, off }
}
