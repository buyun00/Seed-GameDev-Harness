export type SseEventType =
  | 'file:changed'
  | 'analysis:progress'
  | 'analysis:complete'
  | 'analysis:error'
  | 'agent:log'
  | 'agent:status_changed'
  | 'proposal:created'
  | 'proposal:applied'
  | 'scan:updated'
  | 'task:enqueued'
  | 'task:progress'
  | 'task:complete'
  | 'task:failed'
  | 'task:cancelled'

export interface SseEvent {
  type: SseEventType
  data: Record<string, unknown>
  timestamp: string
}
