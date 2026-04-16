<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  RULE_CATEGORY_ORDER,
  type ConstitutionRule,
  type ConstitutionRuleCategory,
} from '@/types/constitution'
import { useI18n } from '@/i18n'

const props = defineProps<{
  rule: ConstitutionRule
  submitting?: boolean
}>()

const emit = defineEmits<{
  save: [changes: {
    category: ConstitutionRuleCategory
    normalizedText: string
    scopeMode: 'current_rule' | 'same_file' | 'same_category' | 'custom'
    scopeDescription: string
  }]
  cancel: []
}>()

const i18n = useI18n()
const category = ref<ConstitutionRuleCategory>(props.rule.category)
const normalizedText = ref(props.rule.normalizedText)
const scopeMode = ref<'current_rule' | 'same_file' | 'same_category' | 'custom'>('current_rule')
const scopeDescription = ref('')

const categoryOptions = computed(() => RULE_CATEGORY_ORDER.map(value => ({
  value,
  label: i18n.ruleCategoryLabel(value),
})))

const canSubmit = computed(() => normalizedText.value.trim() && scopeDescription.value.trim() && !props.submitting)

function save() {
  if (!canSubmit.value) return
  emit('save', {
    category: category.value,
    normalizedText: normalizedText.value.trim(),
    scopeMode: scopeMode.value,
    scopeDescription: scopeDescription.value.trim(),
  })
}
</script>

<template>
  <div class="rule-edit">
    <div class="field">
      <label class="field__label">所属分类</label>
      <select v-model="category" class="field__input" :disabled="submitting">
        <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="field">
      <label class="field__label">修改范围</label>
      <select v-model="scopeMode" class="field__input" :disabled="submitting">
        <option value="current_rule">仅当前规则</option>
        <option value="same_file">当前文件相关规则</option>
        <option value="same_category">同分类相关规则</option>
        <option value="custom">自定义范围</option>
      </select>
    </div>

    <div class="field">
      <label class="field__label">范围说明 <span class="required">*</span></label>
      <textarea
        v-model="scopeDescription"
        class="field__textarea"
        rows="4"
        :disabled="submitting"
        placeholder="用自然语言描述要改哪些文件或规则，例如：只修改最上层规则，下层冲突项删除。或：所有同类规则都统一改成下面这条。"
      />
    </div>

    <div class="field">
      <label class="field__label">规则内容 <span class="required">*</span></label>
      <textarea
        v-model="normalizedText"
        class="field__textarea field__textarea--content"
        rows="7"
        :disabled="submitting"
        placeholder="输入修改后的规则内容。若不同文件需要不同内容，也可以在这里用自然语言分别说明。"
      />
    </div>

    <div class="rule-edit__actions">
      <button class="btn btn--ghost" :disabled="submitting" @click="$emit('cancel')">{{ i18n.cancelButton }}</button>
      <button class="btn btn--primary" :disabled="!canSubmit" @click="save">
        <span v-if="submitting" class="spinner" />
        <span>{{ submitting ? '生成中...' : i18n.generateProposal }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.rule-edit { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field__label { font-size: 12px; font-weight: 500; color: #65686f; }
.required { color: #ef4444; }
.field__input {
  padding: 8px 12px;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: #fff;
}
.field__input:focus { border-color: #1a5bc7; }
.field__textarea {
  padding: 8px 12px;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  outline: none;
  line-height: 1.55;
}
.field__textarea:focus { border-color: #1a5bc7; }
.field__textarea--content {
  font-size: 14px;
  color: #1c1f26;
}
.rule-edit__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn--ghost { background: #f0f1f3; color: #1c1f26; }
.btn--primary { background: #1a5bc7; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1550b3; }
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
