import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as memoryApi from '@/api/autoMemory'
import type { MemoryObject, MemoryScanResult, MemoryType, MemoryStatus } from '@/types/memory'

export const useAutoMemoryStore = defineStore('autoMemory', () => {
  const scanResult = ref<MemoryScanResult | null>(null)
  const loading = ref(false)
  const selectedId = ref<string | null>(null)
  const filterType = ref<MemoryType | null>(null)
  const filterStatus = ref<MemoryStatus | null>(null)

  const objects = computed(() => {
    if (!scanResult.value) return []
    let list = scanResult.value.objects
    if (filterType.value) list = list.filter(o => o.type === filterType.value)
    if (filterStatus.value) list = list.filter(o => o.status === filterStatus.value)
    return list
  })

  const selectedObject = computed(() =>
    objects.value.find(o => o.id === selectedId.value) ?? null
  )

  async function load() {
    loading.value = true
    try {
      scanResult.value = await memoryApi.fetchAutoMemory()
    } catch { /* ignore */ }
    loading.value = false
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  return {
    scanResult, loading, selectedId, filterType, filterStatus,
    objects, selectedObject,
    load, select,
  }
})
