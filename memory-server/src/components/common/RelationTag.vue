<script setup lang="ts">
import { computed } from 'vue'
import type { Relation } from '@/types/constitution'
import { useI18n } from '@/i18n'

const props = defineProps<{ relation: Relation }>()

const i18n = useI18n()
const label = computed(() => i18n.relationLabel(props.relation.type))
const color = computed(() => {
  const map: Record<string, string> = {
    shadowed_by: 'orange',
    conflicts_with: 'red',
    overlaps_with: 'blue',
    reinforced_by: 'green',
    more_specific_than: 'blue',
    likely_supersedes: 'orange',
  }
  return map[props.relation.type] || 'grey'
})
</script>

<template>
  <span class="relation-tag" :data-color="color" :title="relation.description">
    {{ label }}
  </span>
</template>

<style scoped>
.relation-tag {
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  cursor: help;
}
.relation-tag[data-color="orange"] { background: #fff3e0; color: #b36b00; }
.relation-tag[data-color="red"] { background: #ffeaea; color: #cc3333; }
.relation-tag[data-color="blue"] { background: #e8f0fe; color: #1a5bc7; }
.relation-tag[data-color="green"] { background: #e6f7ee; color: #00804a; }
.relation-tag[data-color="grey"] { background: #f0f1f3; color: #65686f; }
</style>
