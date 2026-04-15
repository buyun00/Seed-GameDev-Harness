<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAutoMemoryStore } from '@/stores/autoMemory'
import { useProposalStore } from '@/stores/proposal'
import { proposeMemoryEdit } from '@/api/autoMemory'
import { useFileChange } from '@/composables/useFileChange'
import PageHeader from '@/layouts/PageHeader.vue'
import InspectorSideSheet from '@/layouts/InspectorSideSheet.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MemoryEditForm from './components/MemoryEditForm.vue'
import { formatDate, truncate } from '@/utils/format'
import type { MemoryObject, MemoryType, MemoryStatus } from '@/types/memory'

const store = useAutoMemoryStore()
const proposalStore = useProposalStore()
const editing = ref(false)

onMounted(() => store.load())
useFileChange(() => store.load())

async function handleEdit(changes: Record<string, unknown>, _intent: string) {
  if (!store.selectedObject) return
  try {
    const proposal = await proposeMemoryEdit(store.selectedObject.id, changes)
    proposalStore.showReview(proposal)
    editing.value = false
  } catch { /* ignore */ }
}

const typeOptions: MemoryType[] = ['user', 'feedback', 'project', 'reference']
const statusOptions: MemoryStatus[] = ['indexed', 'unindexed', 'stale', 'duplicate']

function selectMemory(obj: MemoryObject) {
  store.select(obj.id)
}
</script>

<template>
  <div class="memory-page">
    <PageHeader title="Auto Memory" subtitle="Claude Code automatic memory system" />

    <div v-if="store.scanResult" class="memory-summary">
      <div class="summary-card" v-for="(val, key) in store.scanResult.summary" :key="key">
        <span class="summary-card__value">{{ val }}</span>
        <span class="summary-card__label">{{ key }}</span>
      </div>
    </div>

    <div class="memory-layout">
      <aside class="memory-sidebar">
        <div class="filter-section">
          <h4 class="filter-title">Type</h4>
          <button
            v-for="t in typeOptions" :key="t"
            :class="['filter-btn', { 'filter-btn--active': store.filterType === t }]"
            @click="store.filterType = store.filterType === t ? null : t"
          >{{ t }}</button>
        </div>
        <div class="filter-section">
          <h4 class="filter-title">Status</h4>
          <button
            v-for="s in statusOptions" :key="s"
            :class="['filter-btn', { 'filter-btn--active': store.filterStatus === s }]"
            @click="store.filterStatus = store.filterStatus === s ? null : s"
          >{{ s }}</button>
        </div>
        <div v-if="store.scanResult" class="diagnostics">
          <p class="diagnostics__method">Method: {{ store.scanResult.resolutionMethod }}</p>
          <p class="diagnostics__path" :title="store.scanResult.resolvedPath ?? ''">
            {{ store.scanResult.resolvedPath ? truncate(store.scanResult.resolvedPath, 40) : 'Not resolved' }}
          </p>
        </div>
      </aside>

      <main class="memory-main">
        <div v-if="store.loading" class="loading">Loading...</div>
        <EmptyState v-else-if="store.objects.length === 0" title="No memory objects" description="No auto memory found for this project." />
        <div v-else class="memory-grid">
          <div
            v-for="obj in store.objects"
            :key="obj.id"
            :class="['memory-card', { 'memory-card--selected': store.selectedId === obj.id }]"
            @click="selectMemory(obj)"
          >
            <div class="memory-card__header">
              <span class="memory-card__title">{{ obj.title }}</span>
              <StatusBadge :status="obj.status" />
            </div>
            <p class="memory-card__desc">{{ truncate(obj.description, 100) }}</p>
            <div class="memory-card__meta">
              <span class="memory-card__type">{{ obj.type }}</span>
              <span class="memory-card__date">{{ formatDate(obj.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <InspectorSideSheet
      :visible="!!store.selectedObject"
      :title="store.selectedObject?.title ?? ''"
      @close="store.select(null); editing = false"
    >
      <template v-if="store.selectedObject && !editing">
        <div class="inspector-section">
          <div class="detail-row"><span class="label">Type</span><span>{{ store.selectedObject.type }}</span></div>
          <div class="detail-row"><span class="label">Status</span><StatusBadge :status="store.selectedObject.status" /></div>
          <div class="detail-row"><span class="label">Indexed</span><span>{{ store.selectedObject.indexed ? 'Yes' : 'No' }}</span></div>
          <div class="detail-row"><span class="label">Path</span><code>{{ store.selectedObject.sourcePath }}</code></div>
          <div class="detail-row"><span class="label">Updated</span><span>{{ formatDate(store.selectedObject.updatedAt) }}</span></div>
        </div>
        <div class="inspector-section">
          <h4>Content</h4>
          <pre class="content-pre">{{ store.selectedObject.content }}</pre>
        </div>
      </template>
      <MemoryEditForm
        v-if="store.selectedObject && editing"
        :memory="store.selectedObject"
        @save="handleEdit"
        @cancel="editing = false"
      />
      <template #footer v-if="store.selectedObject && !editing">
        <button class="btn btn--secondary" @click="editing = true">Edit</button>
      </template>
    </InspectorSideSheet>
  </div>
</template>

<style scoped>
.memory-page { min-height: 100%; }
.memory-summary {
  display: flex; gap: 12px; padding: 16px 28px;
}
.summary-card {
  background: #fff; border: 1px solid #e8eaed; border-radius: 8px;
  padding: 12px 20px; text-align: center; flex: 1;
}
.summary-card__value { display: block; font-size: 24px; font-weight: 700; color: #1c1f26; }
.summary-card__label { font-size: 12px; color: #65686f; text-transform: capitalize; }

.memory-layout { display: flex; gap: 0; padding: 0 28px 28px; }
.memory-sidebar {
  width: 200px; min-width: 200px; padding-right: 20px;
  border-right: 1px solid #e8eaed;
}
.filter-section { margin-bottom: 20px; }
.filter-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
.filter-btn {
  display: block; width: 100%; text-align: left;
  padding: 6px 10px; margin: 2px 0; border: none; background: none;
  font-size: 13px; border-radius: 4px; cursor: pointer; color: #65686f;
  text-transform: capitalize;
}
.filter-btn:hover { background: #f0f1f3; }
.filter-btn--active { background: #e8f0fe; color: #1a5bc7; font-weight: 500; }
.diagnostics { margin-top: 20px; font-size: 11px; color: #9ca3af; }
.diagnostics__method { margin-bottom: 2px; }
.diagnostics__path { word-break: break-all; }

.memory-main { flex: 1; padding-left: 20px; }
.loading { text-align: center; padding: 40px; color: #65686f; }
.memory-grid { display: flex; flex-direction: column; gap: 8px; }
.memory-card {
  background: #fff; border: 1px solid #e8eaed; border-radius: 8px;
  padding: 14px 18px; cursor: pointer; transition: border-color 0.15s;
}
.memory-card:hover { border-color: #c1c5cc; }
.memory-card--selected { border-color: #1a5bc7; box-shadow: 0 0 0 1px #1a5bc7; }
.memory-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.memory-card__title { font-size: 14px; font-weight: 600; }
.memory-card__desc { font-size: 13px; color: #65686f; margin-bottom: 8px; }
.memory-card__meta { display: flex; gap: 12px; font-size: 12px; color: #9ca3af; }
.memory-card__type { text-transform: capitalize; }

.inspector-section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f1f3; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 13px; }
.label { color: #65686f; font-size: 12px; }
.content-pre {
  background: #f7f8fa; padding: 12px; border-radius: 6px;
  font-size: 12px; white-space: pre-wrap; max-height: 400px; overflow-y: auto;
  border: 1px solid #e8eaed; margin-top: 8px;
}
.btn { padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
.btn--secondary { background: #1c1f26; color: #fff; }
.btn--secondary:hover { background: #2d3139; }
</style>
