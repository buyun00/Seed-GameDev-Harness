import { useSSE } from './useSSE'

export function useFileChange(callback: (data: Record<string, unknown>) => void) {
  const sse = useSSE()
  sse.connect()
  sse.on('file:changed', callback)
  sse.on('scan:updated', callback)

  return { connected: sse.connected }
}
