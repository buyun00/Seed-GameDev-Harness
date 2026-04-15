<script setup lang="ts">
import { computed } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useI18n } from '@/i18n'

const store = useConstitutionStore()
const i18n = useI18n()

defineProps<{ activeTab: string }>()
defineEmits<{ 'update:activeTab': [value: string] }>()

const tabs = computed(() => [
  { key: 'effective', label: i18n.value.tabEffective, color: '#00b365' },
  { key: 'shadowed', label: i18n.value.tabShadowed, color: '#f59e0b' },
  { key: 'conflicting', label: i18n.value.tabConflicting, color: '#ef4444' },
  { key: 'unresolved', label: i18n.value.tabUnresolved, color: '#9ca3af' },
])
</script>

<template>
  <div class="rule-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['rule-tabs__item', { 'rule-tabs__item--active': activeTab === tab.key }]"
      @click="$emit('update:activeTab', tab.key)"
    >
      <span class="rule-tabs__dot" :style="{ background: tab.color }" />
      <span>{{ tab.label }}</span>
      <span class="rule-tabs__count">{{ (store.statusSummary as Record<string, number>)[tab.key] ?? 0 }}</span>
    </button>
  </div>
</template>

<style scoped>
.rule-tabs {
  display: flex;
  gap: 4px;
  padding: 0 28px;
  border-bottom: 1px solid #e8eaed;
}
.rule-tabs__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 13px;
  color: #65686f;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.rule-tabs__item:hover {
  color: #1c1f26;
}
.rule-tabs__item--active {
  color: #1c1f26;
  font-weight: 600;
  border-bottom-color: #1c1f26;
}
.rule-tabs__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.rule-tabs__count {
  font-size: 11px;
  background: #f0f1f3;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
</style>
