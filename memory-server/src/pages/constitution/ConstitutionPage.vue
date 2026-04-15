<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useProposalStore } from '@/stores/proposal'
import { useFileChange } from '@/composables/useFileChange'
import PageHeader from '@/layouts/PageHeader.vue'
import AnalysisStatusBanner from './components/AnalysisStatusBanner.vue'
import RuleStatusTabs from './components/RuleStatusTabs.vue'
import RuleCard from './components/RuleCard.vue'
import RuleInspectorSideSheet from './components/RuleInspectorSideSheet.vue'
import SourceDocumentsPanel from './components/SourceDocumentsPanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { ConstitutionRule } from '@/types/constitution'

const store = useConstitutionStore()
const proposalStore = useProposalStore()

const activeStatusTab = ref('effective')
const mainTab = ref<'rules' | 'sources'>('rules')
const selectedRule = ref<ConstitutionRule | null>(null)
const inspectorVisible = ref(false)

const filteredRules = computed(() => {
  return store.rules.filter(r => r.status === activeStatusTab.value)
})

onMounted(() => store.load())

useFileChange(() => store.load())

function selectRule(rule: ConstitutionRule) {
  selectedRule.value = rule
  inspectorVisible.value = true
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
    <PageHeader title="Constitution" subtitle="Claude Code rule system management" />

    <AnalysisStatusBanner @analyze="store.analyze()" />

    <div class="page-tabs">
      <button
        :class="['page-tabs__item', { 'page-tabs__item--active': mainTab === 'rules' }]"
        @click="mainTab = 'rules'"
      >
        Rules View
      </button>
      <button
        :class="['page-tabs__item', { 'page-tabs__item--active': mainTab === 'sources' }]"
        @click="mainTab = 'sources'"
      >
        Source Documents
      </button>
    </div>

    <template v-if="mainTab === 'rules'">
      <RuleStatusTabs v-model:active-tab="activeStatusTab" />

      <div class="rules-content">
        <div v-if="store.loading" class="rules-loading">Loading...</div>

        <EmptyState
          v-else-if="store.analysisStatus === 'none'"
          title="No analysis yet"
          description="Run your first analysis to extract and categorize rules from your CLAUDE.md files."
        />

        <EmptyState
          v-else-if="filteredRules.length === 0"
          title="No rules in this category"
          :description="`No ${activeStatusTab} rules found in the current analysis.`"
        />

        <div v-else class="rules-grid">
          <RuleCard
            v-for="rule in filteredRules"
            :key="rule.id"
            :rule="rule"
            @select="selectRule"
          />
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
</style>
