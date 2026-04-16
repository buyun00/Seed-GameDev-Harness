<script setup lang="ts">
import { ref } from 'vue'
import type { ConstitutionRule, ConstitutionRuleCategory } from '@/types/constitution'
import InspectorSideSheet from '@/layouts/InspectorSideSheet.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import RelationTag from '@/components/common/RelationTag.vue'
import RuleEditForm from './RuleEditForm.vue'
import { useI18n } from '@/i18n'

const props = defineProps<{
  rule: ConstitutionRule | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [rule: ConstitutionRule, changes: {
    category: ConstitutionRuleCategory
    normalizedText: string
    scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
    scopeDescription: string
  }]
}>()

const editing = ref(false)
const submitting = ref(false)
const i18n = useI18n()

async function handleSave(
  rule: ConstitutionRule,
  changes: {
    category: ConstitutionRuleCategory
    normalizedText: string
    scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
    scopeDescription: string
  },
) {
  if (submitting.value) return
  submitting.value = true
  try {
    await Promise.resolve(emit('edit', rule, changes))
    editing.value = false
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <InspectorSideSheet :visible="visible" :title="i18n.normalizedRule" @close="$emit('close'); editing = false">
    <template v-if="rule && !editing">
      <div class="detail-section">
        <div class="detail-row">
          <span class="detail-label">{{ i18n.labelStatus }}</span>
          <StatusBadge :status="rule.status" />
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ i18n.labelType }}</span>
          <span>{{ i18n.ruleCategoryLabel(rule.category) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ i18n.labelSource }}</span>
          <code class="detail-code">{{ rule.sourceFile }}:{{ rule.sourceSpan.startLine }}-{{ rule.sourceSpan.endLine }}</code>
        </div>
        <div v-if="rule.scope" class="detail-row">
          <span class="detail-label">{{ i18n.labelScope }}</span>
          <span>{{ rule.scope }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-heading">{{ i18n.normalizedRule }}</h4>
        <p class="detail-text">{{ rule.normalizedText }}</p>
      </div>

      <div class="detail-section">
        <h4 class="detail-heading">{{ i18n.originalExcerpt }}</h4>
        <pre class="detail-pre">{{ rule.originalExcerpt }}</pre>
      </div>

      <div v-if="rule.relations.length" class="detail-section">
        <h4 class="detail-heading">{{ i18n.relationsHeading }}</h4>
        <div class="relations-list">
          <div v-for="(rel, idx) in rule.relations" :key="idx" class="relation-item">
            <RelationTag :relation="rel" />
            <span class="relation-desc">{{ rel.description }}</span>
          </div>
        </div>
      </div>
    </template>

    <RuleEditForm
      v-if="rule && editing"
      :rule="rule"
      :submitting="submitting"
      @cancel="editing = false"
      @save="(changes) => handleSave(rule!, changes)"
    />

    <template #footer v-if="rule && !editing">
      <button class="btn btn--secondary" @click="editing = true">{{ i18n.editRuleButton }}</button>
    </template>
  </InspectorSideSheet>
</template>

<style scoped>
.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f1f3;
}
.detail-section:last-child {
  border-bottom: none;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}
.detail-label {
  font-size: 12px;
  color: #65686f;
  font-weight: 500;
}
.detail-code {
  font-size: 12px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  background: #f0f1f3;
  padding: 2px 6px;
  border-radius: 3px;
}
.detail-heading {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1c1f26;
}
.detail-text {
  font-size: 13px;
  color: #1c1f26;
  line-height: 1.6;
}
.detail-pre {
  font-size: 12px;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  color: #1c1f26;
  line-height: 1.5;
  border: 1px solid #e8eaed;
}
.relations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.relation-desc {
  font-size: 12px;
  color: #65686f;
}
.btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn--secondary {
  background: #1c1f26;
  color: #fff;
}
.btn--secondary:hover {
  background: #2d3139;
}
</style>
