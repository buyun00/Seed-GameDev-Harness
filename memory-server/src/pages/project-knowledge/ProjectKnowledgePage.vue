<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useProjectKnowledgeStore } from '@/stores/projectKnowledge'
import { useProposalStore } from '@/stores/proposal'
import { proposeDistill } from '@/api/projectKnowledge'
import { useFileChange } from '@/composables/useFileChange'
import { useI18n } from '@/i18n'
import PageHeader from '@/layouts/PageHeader.vue'
import InspectorSideSheet from '@/layouts/InspectorSideSheet.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatDate, truncate, capitalize } from '@/utils/format'
import type { KnowledgeObject } from '@/types/knowledge'

const store = useProjectKnowledgeStore()
const proposalStore = useProposalStore()
const i18n = useI18n()

onMounted(() => store.load())
useFileChange(() => store.load())

function selectKnowledge(obj: KnowledgeObject) {
  store.select(obj.id)
}

async function distill(targetType: 'rule' | 'memory') {
  if (!store.selectedObject) return
  try {
    const proposal = await proposeDistill(store.selectedObject.id, targetType)
    proposalStore.showReview(proposal)
  } catch { /* ignore */ }
}

const affinityLabels = computed(() => ({
  affects_constitution: i18n.value.affinityAffectsConstitution,
  candidate_for_memory: i18n.value.affinityMemoryCandidate,
  reference_only: i18n.value.affinityReferenceOnly,
}))
</script>

<template>
  <div class="knowledge-page">
    <PageHeader :title="i18n.pageKnowledgeTitle" :subtitle="i18n.pageKnowledgeSubtitle" />

    <div class="knowledge-layout">
      <aside class="knowledge-sidebar">
        <h4 class="sidebar-title">{{ i18n.categoriesTitle }}</h4>
        <button
          :class="['cat-btn', { 'cat-btn--active': !store.filterCategory }]"
          @click="store.filterCategory = null"
        >
          {{ i18n.allCategory }} <span class="cat-count">{{ store.objects.length }}</span>
        </button>
        <button
          v-for="cat in store.categories"
          :key="cat.category"
          :class="['cat-btn', { 'cat-btn--active': store.filterCategory === cat.category }]"
          @click="store.filterCategory = store.filterCategory === cat.category ? null : cat.category"
        >
          {{ capitalize(cat.category.replace(/_/g, ' ')) }}
          <span class="cat-count">{{ cat.count }}</span>
        </button>
      </aside>

      <main class="knowledge-main">
        <div v-if="store.loading" class="loading">{{ i18n.loading }}</div>
        <EmptyState v-else-if="store.filteredObjects.length === 0" :title="i18n.emptyNoKnowledge" :description="i18n.emptyNoKnowledgeDesc" />
        <div v-else class="knowledge-grid">
          <div
            v-for="obj in store.filteredObjects"
            :key="obj.id"
            :class="['knowledge-card', { 'knowledge-card--selected': store.selectedId === obj.id }]"
            @click="selectKnowledge(obj)"
          >
            <div class="knowledge-card__header">
              <span class="knowledge-card__title">{{ obj.title }}</span>
              <StatusBadge :status="obj.status" />
            </div>
            <p class="knowledge-card__summary">{{ truncate(obj.summary, 120) }}</p>
            <div class="knowledge-card__meta">
              <span class="knowledge-card__cat">{{ obj.category.replace(/_/g, ' ') }}</span>
              <span class="knowledge-card__affinity">{{ affinityLabels[obj.layerAffinity as keyof typeof affinityLabels] || obj.layerAffinity }}</span>
              <span class="knowledge-card__date">{{ formatDate(obj.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <InspectorSideSheet
      :visible="!!store.selectedObject"
      :title="store.selectedObject?.title ?? ''"
      @close="store.select(null)"
    >
      <template v-if="store.selectedObject">
        <div class="inspector-section">
          <div class="detail-row"><span class="label">{{ i18n.labelCategory }}</span><span>{{ capitalize(store.selectedObject.category.replace(/_/g, ' ')) }}</span></div>
          <div class="detail-row"><span class="label">{{ i18n.labelStatus }}</span><StatusBadge :status="store.selectedObject.status" /></div>
          <div class="detail-row"><span class="label">{{ i18n.labelLayer }}</span><span>{{ affinityLabels[store.selectedObject.layerAffinity as keyof typeof affinityLabels] }}</span></div>
          <div class="detail-row"><span class="label">{{ i18n.labelPath }}</span><code>{{ store.selectedObject.sourcePath }}</code></div>
          <div class="detail-row"><span class="label">{{ i18n.labelUpdated }}</span><span>{{ formatDate(store.selectedObject.updatedAt) }}</span></div>
        </div>
        <div class="inspector-section">
          <h4>{{ i18n.summaryHeading }}</h4>
          <p class="summary-text">{{ store.selectedObject.summary }}</p>
        </div>
      </template>
      <template #footer v-if="store.selectedObject">
        <button class="btn btn--secondary" @click="distill('rule')">{{ i18n.distillToRule }}</button>
        <button class="btn btn--secondary" @click="distill('memory')">{{ i18n.distillToMemory }}</button>
      </template>
    </InspectorSideSheet>
  </div>
</template>

<style scoped>
.knowledge-page { min-height: 100%; }
.knowledge-layout { display: flex; gap: 0; padding: 20px 28px; }
.knowledge-sidebar {
  width: 200px; min-width: 200px; padding-right: 20px;
  border-right: 1px solid #e8eaed;
}
.sidebar-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
.cat-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 6px 10px; margin: 2px 0; border: none; background: none;
  font-size: 13px; border-radius: 4px; cursor: pointer; color: #65686f;
  text-transform: capitalize;
}
.cat-btn:hover { background: #f0f1f3; }
.cat-btn--active { background: #e8f0fe; color: #1a5bc7; font-weight: 500; }
.cat-count { font-size: 11px; background: #f0f1f3; padding: 0 6px; border-radius: 10px; }

.knowledge-main { flex: 1; padding-left: 20px; }
.loading { text-align: center; padding: 40px; color: #65686f; }
.knowledge-grid { display: flex; flex-direction: column; gap: 8px; }
.knowledge-card {
  background: #fff; border: 1px solid #e8eaed; border-radius: 8px;
  padding: 14px 18px; cursor: pointer; transition: border-color 0.15s;
}
.knowledge-card:hover { border-color: #c1c5cc; }
.knowledge-card--selected { border-color: #1a5bc7; box-shadow: 0 0 0 1px #1a5bc7; }
.knowledge-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.knowledge-card__title { font-size: 14px; font-weight: 600; }
.knowledge-card__summary { font-size: 13px; color: #65686f; margin-bottom: 8px; line-height: 1.4; }
.knowledge-card__meta { display: flex; gap: 12px; font-size: 12px; color: #9ca3af; }
.knowledge-card__cat { text-transform: capitalize; }

.inspector-section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f1f3; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 13px; }
.label { color: #65686f; font-size: 12px; }
.summary-text { font-size: 13px; line-height: 1.6; margin-top: 8px; }

.btn { padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
.btn--secondary { background: #1c1f26; color: #fff; }
.btn--secondary:hover { background: #2d3139; }
</style>
