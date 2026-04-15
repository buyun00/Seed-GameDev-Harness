import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchStatus } from '@/api/status'
import { bootstrap } from '@/api/client'
import type { ApiStatus } from '@/types/api'

export const useAppStore = defineStore('app', () => {
  const authenticated = ref(false)
  const status = ref<ApiStatus | null>(null)
  const loading = ref(true)

  async function initialize() {
    // Try fetching status with existing cookie
    let ok = await tryFetchStatus()
    if (!ok) {
      // No valid session — bootstrap a new one
      const bootstrapped = await bootstrap()
      if (bootstrapped) {
        ok = await tryFetchStatus()
      }
    }
    authenticated.value = ok
    loading.value = false
  }

  async function tryFetchStatus(): Promise<boolean> {
    try {
      status.value = await fetchStatus()
      return true
    } catch {
      return false
    }
  }

  async function refreshStatus() {
    try {
      status.value = await fetchStatus()
    } catch { /* ignore */ }
  }

  return { authenticated, status, loading, initialize, refreshStatus }
})
