import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { LlmConfig } from '../core/llm-provider.js'

export interface SettingsData {
  language: string
  theme: string
  apiConfigs: Array<{
    key: string
    config: LlmConfig
  }>
  activeApiKey: string
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

const DEFAULT_SETTINGS: SettingsData = {
  language: 'zh',
  theme: 'dark',
  apiConfigs: [],
  activeApiKey: '',
  chatHistory: [],
}

export class SettingsStore {
  private data: SettingsData
  private filePath: string

  constructor(projectRoot: string) {
    const seedDir = join(projectRoot, '.seed')
    if (!existsSync(seedDir)) {
      mkdirSync(seedDir, { recursive: true })
    }
    this.filePath = join(seedDir, 'settings.json')
    this.data = this.load()
  }

  private load(): SettingsData {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      process.stderr.write('[Settings] Failed to load settings, using defaults\n')
    }
    return { ...DEFAULT_SETTINGS }
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch {
      process.stderr.write('[Settings] Failed to save settings\n')
    }
  }

  get<K extends keyof SettingsData>(key: K): SettingsData[K] {
    return this.data[key]
  }

  set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void {
    (this.data as any)[key] = value
    this.save()
  }

  getAll(): SettingsData {
    return { ...this.data }
  }

  updateChatHistory(history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>): void {
    this.data.chatHistory = history.slice(-200)
    this.save()
  }
}
