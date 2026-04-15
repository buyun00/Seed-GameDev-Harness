<script setup lang="ts">
import { ref } from 'vue'
import type { ConstitutionRule } from '@/types/constitution'
import { useI18n } from '@/i18n'

const props = defineProps<{ rule: ConstitutionRule }>()
const emit = defineEmits<{
  save: [changes: { title?: string; normalizedText?: string }, intent: string]
  cancel: []
}>()

const i18n = useI18n()
const title = ref(props.rule.title)
const normalizedText = ref(props.rule.normalizedText)
const editIntent = ref('')

function save() {
  if (!editIntent.value.trim()) return
  const changes: { title?: string; normalizedText?: string } = {}
  if (title.value !== props.rule.title) changes.title = title.value
  if (normalizedText.value !== props.rule.normalizedText) changes.normalizedText = normalizedText.value
  emit('save', changes, editIntent.value)
}
</script>

<template>
  <div class="rule-edit">
    <div class="field">
      <label class="field__label">{{ i18n.labelTitle }}</label>
      <input v-model="title" class="field__input" />
    </div>
    <div class="field">
      <label class="field__label">{{ i18n.labelRuleContent }}</label>
      <textarea v-model="normalizedText" class="field__textarea" rows="6" />
    </div>
    <div class="field">
      <label class="field__label">{{ i18n.labelEditIntent }} <span class="required">*</span></label>
      <input v-model="editIntent" class="field__input" :placeholder="i18n.editIntentPlaceholder" />
    </div>
    <div class="rule-edit__actions">
      <button class="btn btn--ghost" @click="$emit('cancel')">{{ i18n.cancelButton }}</button>
      <button class="btn btn--primary" :disabled="!editIntent.trim()" @click="save">
        {{ i18n.generateProposal }}
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
}
.field__textarea:focus { border-color: #1a5bc7; }
.rule-edit__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--ghost { background: #f0f1f3; color: #1c1f26; }
.btn--primary { background: #1a5bc7; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1550b3; }
</style>
