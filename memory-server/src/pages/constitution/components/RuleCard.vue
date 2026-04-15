<script setup lang="ts">
import type { ConstitutionRule } from '@/types/constitution'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfidenceIndicator from '@/components/common/ConfidenceIndicator.vue'
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
      <h4 class="rule-card__title">{{ rule.title }}</h4>
      <StatusBadge :status="rule.status" />
    </div>
    <p class="rule-card__text">{{ truncate(rule.normalizedText, 160) }}</p>
    <div class="rule-card__meta">
      <span class="rule-card__source">{{ rule.sourceFile }}</span>
      <span class="rule-card__lines">L{{ rule.sourceSpan.startLine }}-{{ rule.sourceSpan.endLine }}</span>
      <ConfidenceIndicator :value="rule.confidence" />
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
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.rule-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #1c1f26;
}
.rule-card__text {
  font-size: 13px;
  color: #65686f;
  line-height: 1.5;
  margin-bottom: 10px;
}
.rule-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
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
