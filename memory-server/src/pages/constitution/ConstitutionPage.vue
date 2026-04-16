<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useProposalStore } from '@/stores/proposal'
import { useSSE } from '@/composables/useSSE'
import { useI18n } from '@/i18n'
import PageHeader from '@/layouts/PageHeader.vue'
import AnalysisStatusBanner from './components/AnalysisStatusBanner.vue'
import RuleStatusTabs from './components/RuleStatusTabs.vue'
import RuleCard from './components/RuleCard.vue'
import RuleInspectorSideSheet from './components/RuleInspectorSideSheet.vue'
import SourceDocumentsPanel from './components/SourceDocumentsPanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  RULE_CATEGORY_ORDER,
  type ConstitutionRule,
  type ConstitutionRuleCategory,
} from '@/types/constitution'

const store = useConstitutionStore()
const proposalStore = useProposalStore()
const i18n = useI18n()

const activeStatusTab = ref('effective')
const mainTab = ref<'rules' | 'sources'>('rules')
const selectedRule = ref<ConstitutionRule | null>(null)
const inspectorVisible = ref(false)
const sse = useSSE()

const filteredRules = computed(() => {
  return store.rules.filter(r => r.status === activeStatusTab.value)
})

const groupedRules = computed(() => {
  return RULE_CATEGORY_ORDER
    .map(category => ({
      category,
      label: i18n.ruleCategoryLabel(category),
      rules: filteredRules.value.filter(rule => rule.category === category),
    }))
    .filter(group => group.rules.length > 0)
})

const activeCategory = ref<ConstitutionRuleCategory | null>(null)

watch(groupedRules, (groups) => {
  activeCategory.value = groups[0]?.category ?? null
}, { immediate: true })

const handleFileUpdated = () => store.load()
const handleAnalysisProgress = (data: Record<string, unknown>) => store.onProgressEvent(data)
const handleAnalysisComplete = async () => {
  store.finishAnalysis()
  await store.load()
}
const handleAnalysisError = (data: Record<string, unknown>) => {
  const message = typeof data.message === 'string' && data.message.trim()
    ? data.message
    : 'Analysis failed'
  store.failAnalysis(message)
}
const handleAgentLog = (data: Record<string, unknown>) => store.onAgentLog(data)

onMounted(() => {
  store.load()
  sse.connect()
  sse.on('file:changed', handleFileUpdated)
  sse.on('scan:updated', handleFileUpdated)
  sse.on('analysis:progress', handleAnalysisProgress)
  sse.on('analysis:complete', handleAnalysisComplete)
  sse.on('analysis:error', handleAnalysisError)
  sse.on('agent:log', handleAgentLog)
})

onUnmounted(() => {
  sse.off('file:changed', handleFileUpdated)
  sse.off('scan:updated', handleFileUpdated)
  sse.off('analysis:progress', handleAnalysisProgress)
  sse.off('analysis:complete', handleAnalysisComplete)
  sse.off('analysis:error', handleAnalysisError)
  sse.off('agent:log', handleAgentLog)
})

function selectRule(rule: ConstitutionRule) {
  selectedRule.value = rule
  inspectorVisible.value = true
}

function jumpToCategory(category: ConstitutionRuleCategory) {
  activeCategory.value = category
  document.getElementById(`rule-category-${category}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

async function handleEdit(rule: ConstitutionRule, changes: { title?: string; normalizedText?: string }, intent: string) {
  const proposal = await store.proposeEdit(rule.id, changes, intent)
  if (proposal) {
    proposalStore.showReview(proposal)
  }
}
</script>

<template>
  <div class="constitution-page">
    <PageHeader :title="i18n.pageConstitutionTitle" :subtitle="i18n.pageConstitutionSubtitle" />

    <AnalysisStatusBanner @analyze="store.analyze()" />

    <div class="page-tabs">
      <button
        :class="['page-tabs__item', { 'page-tabs__item--active': mainTab === 'rules' }]"
        @click="mainTab = 'rules'"
      >
        {{ i18n.tabRulesView }}
      </button>
      <button
        :class="['page-tabs__item', { 'page-tabs__item--active': mainTab === 'sources' }]"
        @click="mainTab = 'sources'"
      >
        {{ i18n.tabSourceDocs }}
      </button>
    </div>

    <template v-if="mainTab === 'rules'">
      <RuleStatusTabs v-model:active-tab="activeStatusTab" />

      <div class="rules-content">
        <div v-if="store.loading" class="rules-loading">{{ i18n.loading }}</div>

        <EmptyState
          v-else-if="store.analysisStatus === 'none'"
          :title="i18n.emptyNoAnalysis"
          :description="i18n.emptyNoAnalysisDesc"
        />

        <EmptyState
          v-else-if="groupedRules.length === 0"
          :title="i18n.emptyNoRulesInCategory"
          :description="i18n.emptyNoRulesDesc(activeStatusTab)"
        />

        <div v-else class="rules-layout">
          <div class="rules-groups">
            <section
              v-for="group in groupedRules"
              :id="`rule-category-${group.category}`"
              :key="group.category"
              class="category-section"
            >
              <div class="category-section__header">
                <div>
                  <div class="category-section__eyebrow">{{ i18n.labelType }}</div>
                  <h3 class="category-section__title">{{ group.label }}</h3>
                </div>
                <span class="category-section__count">{{ group.rules.length }}</span>
              </div>

              <div class="rules-grid">
                <RuleCard
                  v-for="rule in group.rules"
                  :key="rule.id"
                  :rule="rule"
                  @select="selectRule"
                />
              </div>
            </section>
          </div>

          <aside class="rules-sidebar">
            <div class="rules-sidebar__card">
              <div class="rules-sidebar__title">类型导航</div>
              <button
                v-for="group in groupedRules"
                :key="group.category"
                :class="['rules-sidebar__item', { 'rules-sidebar__item--active': activeCategory === group.category }]"
                @click="jumpToCategory(group.category)"
              >
                <span>{{ group.label }}</span>
                <span class="rules-sidebar__count">{{ group.rules.length }}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </template>

    <template v-if="mainTab === 'sources'">
      <div class="sources-content">
        <SourceDocumentsPanel />
      </div>
    </template>

    <RuleInspectorSideSheet
      :rule="selectedRule"
      :visible="inspectorVisible"
      @close="inspectorVisible = false"
      @edit="handleEdit"
    />
  </div>
</template>

<style scoped>
.constitution-page {
  min-height: 100%;
}
.page-tabs {
  display: flex;
  gap: 0;
  padding: 0 28px;
  margin-top: 16px;
  border-bottom: 1px solid #e8eaed;
}
.page-tabs__item {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 13px;
  color: #65686f;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
}
.page-tabs__item:hover { color: #1c1f26; }
.page-tabs__item--active {
  color: #1c1f26;
  border-bottom-color: #1c1f26;
  font-weight: 600;
}
.rules-content, .sources-content {
  padding: 20px 28px;
}
.rules-loading {
  text-align: center;
  padding: 40px;
  color: #65686f;
}
.rules-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rules-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 20px;
  align-items: start;
}
.rules-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.category-section {
  border: 1px solid #e8eaed;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  padding: 16px;
}
.category-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.category-section__eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a9099;
  margin-bottom: 4px;
}
.category-section__title {
  font-size: 18px;
  font-weight: 700;
  color: #1c1f26;
}
.category-section__count {
  min-width: 28px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #1c1f26;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}
.rules-sidebar {
  position: sticky;
  top: 20px;
}
.rules-sidebar__card {
  border: 1px solid #e8eaed;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rules-sidebar__title {
  font-size: 12px;
  font-weight: 700;
  color: #1c1f26;
  padding: 4px 6px 8px;
}
.rules-sidebar__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: none;
  border-radius: 8px;
  background: #f6f7f9;
  color: #444a53;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.rules-sidebar__item:hover {
  background: #eceff3;
  color: #1c1f26;
  transform: translateY(-1px);
}
.rules-sidebar__item--active {
  background: #1c1f26;
  color: #fff;
}
.rules-sidebar__count {
  font-size: 12px;
  opacity: 0.8;
}
@media (max-width: 980px) {
  .rules-layout {
    grid-template-columns: 1fr;
  }
  .rules-sidebar {
    position: static;
    order: -1;
  }
}
</style>
