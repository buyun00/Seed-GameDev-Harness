export function formatDate(iso?: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString()
}

export function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    effective: 'green',
    shadowed: 'orange',
    conflicting: 'red',
    unresolved: 'grey',
    indexed: 'green',
    unindexed: 'blue',
    stale: 'orange',
    duplicate: 'red',
    active: 'green',
    reference_only: 'grey',
    pending: 'blue',
    applied: 'green',
    rejected: 'red',
  }
  return map[status] || 'grey'
}
