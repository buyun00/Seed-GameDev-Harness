import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchStatus } from '@/api/status'
import { bootstrap } from '@/api/client'
import type { ApiStatus } from '@/types/api'

export type LanguageCode = 'en' | 'zh' | 'ja' | 'ko'

export interface LanguageOption {
  code: LanguageCode
  label: string
  flag: string
}

export const languageOptions: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
]

function isValidLanguageCode(code: unknown): code is LanguageCode {
  return typeof code === 'string' && languageOptions.some(opt => opt.code === code)
}

export const useAppStore = defineStore('app', () => {
  const authenticated = ref(false)
  const status = ref<ApiStatus | null>(null)
  const loading = ref(true)
  const language = ref<LanguageCode>('en')

  async function initialize() {
    const saved = localStorage.getItem('seed-language')
    if (isValidLanguageCode(saved)) {
      language.value = saved
    }

    let ok = await tryFetchStatus()
    if (!ok) {
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

  function setLanguage(code: LanguageCode) {
    language.value = code
    localStorage.setItem('seed-language', code)
  }

  return { authenticated, status, loading, language, initialize, refreshStatus, setLanguage }
})
