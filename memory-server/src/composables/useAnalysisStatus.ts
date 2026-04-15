import { computed } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'

export function useAnalysisStatus() {
  const store = useConstitutionStore()

  const statusType = computed(() => {
    switch (store.analysisStatus) {
      case 'up_to_date': return 'success'
      case 'outdated': return 'warning'
      default: return 'info'
    }
  })

  const statusText = computed(() => {
    switch (store.analysisStatus) {
      case 'up_to_date': return `Analysis up to date (${formatDate(store.analyzedAt)})`
      case 'outdated': return `Source files changed since last analysis`
      default: return 'No analysis has been run yet'
    }
  })

  return { statusType, statusText }
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}
