import { computed } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useI18n } from '@/i18n'

export function useAnalysisStatus() {
  const store = useConstitutionStore()
  const i18n = useI18n()

  const statusType = computed(() => {
    switch (store.analysisStatus) {
      case 'up_to_date': return 'success'
      case 'outdated': return 'warning'
      default: return 'info'
    }
  })

  const statusText = computed(() => {
    switch (store.analysisStatus) {
      case 'up_to_date': return i18n.value.statusUpToDate(formatDate(store.analyzedAt))
      case 'outdated': return i18n.value.statusOutdated(formatDate(store.analyzedAt))
      default: return i18n.value.statusNone
    }
  })

  return { statusType, statusText }
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}
