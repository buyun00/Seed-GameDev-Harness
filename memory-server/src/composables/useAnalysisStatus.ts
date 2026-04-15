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
      case 'up_to_date': return `分析结果最新（上次分析：${formatDate(store.analyzedAt)}）`
      case 'outdated': return `分析结果已过期（上次分析：${formatDate(store.analyzedAt)}）`
      default: return '尚未运行分析'
    }
  })

  return { statusType, statusText }
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}
