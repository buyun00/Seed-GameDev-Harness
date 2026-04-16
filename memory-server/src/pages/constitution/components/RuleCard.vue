<script setup lang="ts">
import type { ConstitutionRule } from '@/types/constitution'
import StatusBadge from '@/components/common/StatusBadge.vue'
import RelationTag from '@/components/common/RelationTag.vue'
import { useI18n } from '@/i18n'
import { truncate } from '@/utils/format'

defineProps<{ rule: ConstitutionRule }>()
defineEmits<{ select: [rule: ConstitutionRule] }>()

const i18n = useI18n()
</script>

<template>
  <div class="rule-card" @click="$emit('select', rule)">
    <div class="rule-card__header">
      <StatusBadge :status="rule.status" />
    </div>
    <p class="rule-card__text">{{ truncate(rule.normalizedText, 220) }}</p>
    <div class="rule-card__meta">
      <span class="rule-card__category">{{ i18n.ruleCategoryLabel(rule.category) }}</span>
      <span class="rule-card__source">{{ rule.sourceFile }}</span>
      <span class="rule-card__lines">L{{ rule.sourceSpan.startLine }}-{{ rule.sourceSpan.endLine }}</span>
    </div>
    <div v-if="rule.relations.length" class="rule-card__relations">
      <RelationTag v-for="(rel, i) in rule.relations.slice(0, 3)" :key="i" :relation="rel" />
      <span v-if="rule.relations.length > 3" class="rule-card__more">
        {{ i18n.moreRelations(rule.relations.length - 3) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.rule-card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.rule-card:hover {
  border-color: #c1c5cc;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.rule-card__header {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}
.rule-card__text {
  font-size: 14px;
  color: #1c1f26;
  line-height: 1.65;
  margin-bottom: 10px;
}
.rule-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}
.rule-card__category {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f0f1f3;
  color: #4d5560;
  font-weight: 600;
}
.rule-card__source {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 11px;
}
.rule-card__relations {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
}
.rule-card__more {
  font-size: 11px;
  color: #9ca3af;
  align-self: center;
}
</style>
