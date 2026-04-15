import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as constitutionApi from '@/api/constitution'
import type { ConstitutionRule, AnalysisStatus, SourceFile } from '@/types/constitution'
import type { Proposal } from '@/types/proposal'

export const useConstitutionStore = defineStore('constitution', () => {
  const analysisStatus = ref<AnalysisStatus>('none')
  const analyzedAt = ref<string | undefined>()
  const rules = ref<ConstitutionRule[]>([])
  const statusSummary = ref<Record<string, number>>({})
  const changedFiles = ref<string[]>([])
  const sources = ref<SourceFile[]>([])
  const loading = ref(false)
  const analyzing = ref(false)
  const progressStep = ref('')
  const progressPercent = ref(0)
  const progressLogs = ref<string[]>([])

  const effectiveRules = computed(() => rules.value.filter(r => r.status === 'effective'))
  const shadowedRules = computed(() => rules.value.filter(r => r.status === 'shadowed'))
  const conflictingRules = computed(() => rules.value.filter(r => r.status === 'conflicting'))
  const unresolvedRules = computed(() => rules.value.filter(r => r.status === 'unresolved'))

  async function load() {
    loading.value = true
    try {
      const data = await constitutionApi.fetchConstitution()
      analysisStatus.value = data.status
      analyzedAt.value = data.analyzedAt
      rules.value = data.rules || []
      statusSummary.value = data.statusSummary || {}
      changedFiles.value = data.changedFiles || []
    } catch { /* ignore */ }
    loading.value = false
  }

  async function loadSources() {
    try {
      const data = await constitutionApi.fetchSources()
      sources.value = data.sources
    } catch { /* ignore */ }
  }

  function onProgressEvent(data: Record<string, unknown>) {
    progressStep.value = (data.step as string) || ''
    progressPercent.value = (data.percent as number) || 0
    const msg = data.message as string
    if (msg) {
      progressLogs.value = [...progressLogs.value, `[${new Date().toLocaleTimeString()}] ${msg}`]
    }
    if (progressStep.value === 'done' || progressPercent.value >= 100) {
      analyzing.value = false
    }
  }

  function onAgentLog(data: Record<string, unknown>) {
    const msg = data.message as string
    if (msg?.trim()) {
      progressLogs.value = [...progressLogs.value.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]
    }
  }

  function clearProgress() {
    progressLogs.value = []
    progressStep.value = ''
    progressPercent.value = 0
  }

  function finishAnalysis() {
    analyzing.value = false
    if (progressPercent.value < 100) {
      progressPercent.value = 100
    }
    if (!progressStep.value) {
      progressStep.value = 'done'
    }
  }

  async function analyze() {
    analyzing.value = true
    clearProgress()
    try {
      const data = await constitutionApi.runAnalysis()
      analysisStatus.value = 'up_to_date'
      analyzedAt.value = data.analyzedAt
      rules.value = data.rules || []
      statusSummary.value = data.statusSummary || {}
      changedFiles.value = []
    } catch { /* ignore */ }
  }

  async function proposeEdit(ruleId: string, changes: { title?: string; normalizedText?: string }, editIntent: string): Promise<Proposal | null> {
    try {
      return await constitutionApi.proposeEdit({ ruleId, changes, editIntent })
    } catch {
      return null
    }
  }

  async function proposeCreate(params: { title: string; content: string; targetFile: string; insertAfterSection?: string }): Promise<Proposal | null> {
    try {
      return await constitutionApi.proposeCreate(params)
    } catch {
      return null
    }
  }

  return {
    analysisStatus, analyzedAt, rules, statusSummary, changedFiles,
    sources, loading, analyzing,
    progressStep, progressPercent, progressLogs,
    effectiveRules, shadowedRules, conflictingRules, unresolvedRules,
    load, loadSources, analyze, proposeEdit, proposeCreate,
    onProgressEvent, onAgentLog, clearProgress, finishAnalysis,
  }
})
