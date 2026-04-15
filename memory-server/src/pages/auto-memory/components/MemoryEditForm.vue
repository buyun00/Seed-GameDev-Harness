<script setup lang="ts">
import { ref } from 'vue'
import type { MemoryObject } from '@/types/memory'

const props = defineProps<{ memory: MemoryObject }>()
const emit = defineEmits<{
  save: [changes: Record<string, unknown>, intent: string]
  cancel: []
}>()

const title = ref(props.memory.title)
const description = ref(props.memory.description)
const content = ref(props.memory.content)
const editIntent = ref('')

function save() {
  if (!editIntent.value.trim()) return
  const changes: Record<string, unknown> = {}
  if (title.value !== props.memory.title) changes.title = title.value
  if (description.value !== props.memory.description) changes.description = description.value
  if (content.value !== props.memory.content) changes.content = content.value
  emit('save', changes, editIntent.value)
}
</script>

<template>
  <div class="memory-edit">
    <div class="field">
      <label class="field__label">Title</label>
      <input v-model="title" class="field__input" />
    </div>
    <div class="field">
      <label class="field__label">Description</label>
      <textarea v-model="description" class="field__textarea" rows="3" />
    </div>
    <div class="field">
      <label class="field__label">Content</label>
      <textarea v-model="content" class="field__textarea" rows="8" />
    </div>
    <div class="field">
      <label class="field__label">Edit Intent <span class="required">*</span></label>
      <input v-model="editIntent" class="field__input" placeholder="Describe your changes..." />
    </div>
    <div class="memory-edit__actions">
      <button class="btn btn--ghost" @click="$emit('cancel')">Cancel</button>
      <button class="btn btn--primary" :disabled="!editIntent.trim()" @click="save">
        Generate Proposal
      </button>
    </div>
  </div>
</template>

<style scoped>
.memory-edit { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field__label { font-size: 12px; font-weight: 500; color: #65686f; }
.required { color: #ef4444; }
.field__input {
  padding: 8px 12px; border: 1px solid #e8eaed; border-radius: 6px;
  font-size: 13px; outline: none;
}
.field__input:focus { border-color: #1a5bc7; }
.field__textarea {
  padding: 8px 12px; border: 1px solid #e8eaed; border-radius: 6px;
  font-size: 13px; resize: vertical; font-family: inherit; outline: none;
}
.field__textarea:focus { border-color: #1a5bc7; }
.memory-edit__actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn {
  padding: 6px 16px; border-radius: 6px; font-size: 13px;
  font-weight: 500; cursor: pointer; border: none;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--ghost { background: #f0f1f3; color: #1c1f26; }
.btn--primary { background: #1a5bc7; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1550b3; }
</style>
