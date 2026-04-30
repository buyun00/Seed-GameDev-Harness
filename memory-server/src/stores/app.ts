import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchStatus, updateLanguage } from '@/api/status'
import { fetchSettings, updateSettingLanguage, updateSettingTheme } from '@/api/settings'
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

export type ThemeMode = 'dark' | 'light'

export const useAppStore = defineStore('app', () => {
  const authenticated = ref(false)
  const status = ref<ApiStatus | null>(null)
  const loading = ref(true)
  const language = ref<LanguageCode>('zh')
  const theme = ref<ThemeMode>('dark')

  function applyTheme(mode: ThemeMode) {
    document.documentElement.setAttribute('data-theme', mode)
  }

  async function initialize() {
    let ok = await tryFetchStatus()
    if (!ok) {
      const bootstrapped = await bootstrap()
      if (bootstrapped) {
        ok = await tryFetchStatus()
      }
    }

    if (ok) {
      const settings = await fetchSettings().catch(() => null)
      if (settings) {
        if (isValidLanguageCode(settings.language)) {
          language.value = settings.language as LanguageCode
        }
        if (settings.theme === 'dark' || settings.theme === 'light') {
          theme.value = settings.theme as ThemeMode
        }
      }
    }

    applyTheme(theme.value)
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
    updateLanguage(code).catch(() => {})
    updateSettingLanguage(code).catch(() => {})
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    applyTheme(mode)
    updateSettingTheme(mode).catch(() => {})
  }

  function toggleTheme() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return { authenticated, status, loading, language, theme, initialize, refreshStatus, setLanguage, setTheme, toggleTheme }
})
