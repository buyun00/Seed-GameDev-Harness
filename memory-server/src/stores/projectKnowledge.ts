import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as knowledgeApi from '@/api/projectKnowledge'
import type { KnowledgeObject, KnowledgeCategory } from '@/types/knowledge'

export const useProjectKnowledgeStore = defineStore('projectKnowledge', () => {
  const objects = ref<KnowledgeObject[]>([])
  const loading = ref(false)
  const selectedId = ref<string | null>(null)
  const filterCategory = ref<KnowledgeCategory | null>(null)

  const filteredObjects = computed(() => {
    if (!filterCategory.value) return objects.value
    return objects.value.filter(o => o.category === filterCategory.value)
  })

  const selectedObject = computed(() =>
    objects.value.find(o => o.id === selectedId.value) ?? null
  )

  const categories = computed(() => {
    const map = new Map<KnowledgeCategory, number>()
    for (const obj of objects.value) {
      map.set(obj.category, (map.get(obj.category) || 0) + 1)
    }
    return [...map.entries()].map(([category, count]) => ({ category, count }))
  })

  async function load(category?: string) {
    loading.value = true
    try {
      const data = await knowledgeApi.fetchProjectKnowledge(category)
      objects.value = data.objects
    } catch { /* ignore */ }
    loading.value = false
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  return {
    objects, loading, selectedId, filterCategory,
    filteredObjects, selectedObject, categories,
    load, select,
  }
})
