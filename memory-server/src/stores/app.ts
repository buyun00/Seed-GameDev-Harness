import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchStatus, updateLanguage } from '@/api/status'
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

const languageNameMap: Record<string, LanguageCode> = {
  english: 'en', chinese: 'zh', japanese: 'ja', korean: 'ko',
  '中文': 'zh', '日本語': 'ja', '한국어': 'ko',
}

function normalizeLanguageCode(raw: string): LanguageCode | null {
  const trimmed = raw.toLowerCase().trim()
  if (isValidLanguageCode(trimmed)) return trimmed as LanguageCode
  return languageNameMap[raw.trim()] ?? languageNameMap[trimmed] ?? null
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

    if (!isValidLanguageCode(saved) && status.value?.language) {
      const normalized = normalizeLanguageCode(status.value.language)
      if (normalized) {
        language.value = normalized
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
    updateLanguage(code).catch(() => { /* ignore backend sync errors */ })
  }

  return { authenticated, status, loading, language, initialize, refreshStatus, setLanguage }
})
