<script setup lang="ts">
import type { Proposal } from '@/types/proposal'
import DiffViewer from './DiffViewer.vue'

defineProps<{ proposal: Proposal }>()
</script>

<template>
  <div class="proposal-diff">
    <div class="proposal-diff__summary">
      <h4>{{ proposal.summary }}</h4>
      <span class="proposal-diff__meta">
        {{ proposal.affectedFiles.length }} file(s) affected
      </span>
    </div>
    <div class="proposal-diff__files">
      <DiffViewer
        v-for="file in proposal.affectedFiles"
        :key="file.path"
        :diff="file.diff"
        :file-path="file.path"
      />
    </div>
  </div>
</template>

<style scoped>
.proposal-diff__summary {
  margin-bottom: 16px;
}
.proposal-diff__summary h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.proposal-diff__meta {
  font-size: 12px;
  color: #65686f;
}
.proposal-diff__files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
