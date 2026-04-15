<script setup lang="ts">
import { onMounted } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useI18n } from '@/i18n'
import type { SourceFile } from '@/types/constitution'

const store = useConstitutionStore()
const i18n = useI18n()

onMounted(() => store.loadSources())

function toggle(source: SourceFile & { expanded?: boolean }) {
  (source as any).expanded = !(source as any).expanded
}
</script>

<template>
  <div class="source-docs">
    <div v-for="source in store.sources" :key="source.path" class="source-card">
      <div class="source-card__header" @click="toggle(source)">
        <span class="source-card__icon">{{ (source as any).expanded ? '▾' : '▸' }}</span>
        <span class="source-card__path">{{ source.path }}</span>
        <span v-if="!source.exists" class="source-card__badge source-card__badge--missing">
          {{ i18n.fileNotFound }}
        </span>
        <span v-else class="source-card__badge source-card__badge--ok">
          {{ Math.round(source.content.length / 1024 * 10) / 10 }}KB
        </span>
      </div>
      <div v-if="(source as any).expanded && source.exists" class="source-card__content">
        <pre class="source-card__pre">{{ source.content }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.source-docs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.source-card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
}
.source-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}
.source-card__header:hover {
  background: #f7f8fa;
}
.source-card__icon {
  font-size: 12px;
  color: #9ca3af;
  width: 14px;
}
.source-card__path {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
}
.source-card__badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}
.source-card__badge--ok { background: #e6f7ee; color: #00804a; }
.source-card__badge--missing { background: #ffeaea; color: #cc3333; }
.source-card__content {
  border-top: 1px solid #e8eaed;
  max-height: 400px;
  overflow-y: auto;
}
.source-card__pre {
  padding: 16px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #1c1f26;
  margin: 0;
}
</style>
