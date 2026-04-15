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

  async function analyze() {
    analyzing.value = true
    try {
      const data = await constitutionApi.runAnalysis()
      analysisStatus.value = 'up_to_date'
      analyzedAt.value = data.analyzedAt
      rules.value = data.rules || []
      statusSummary.value = data.statusSummary || {}
      changedFiles.value = []
    } catch { /* ignore */ }
    analyzing.value = false
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
    effectiveRules, shadowedRules, conflictingRules, unresolvedRules,
    load, loadSources, analyze, proposeEdit, proposeCreate,
  }
})
