<script setup lang="ts">
import type { Proposal } from '@/types/proposal'
import ProposalDiffPanel from './ProposalDiffPanel.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useI18n } from '@/i18n'

defineProps<{ proposal: Proposal }>()
defineEmits<{
  close: []
  apply: []
  reject: []
}>()

const i18n = useI18n()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <div class="modal__title-group">
            <h2 class="modal__title">{{ i18n.reviewProposal }}</h2>
            <StatusBadge :status="proposal.status" />
          </div>
          <button class="modal__close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal__body">
          <ProposalDiffPanel :proposal="proposal" />
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" @click="$emit('reject')">{{ i18n.rejectButton }}</button>
          <button class="btn btn--ghost" @click="$emit('close')">{{ i18n.cancelButton }}</button>
          <button
            class="btn btn--primary"
            :disabled="proposal.status !== 'pending'"
            @click="$emit('apply')"
          >
            {{ i18n.applyChanges }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal {
  background: #fff;
  border-radius: 12px;
  width: 90vw;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8eaed;
}
.modal__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal__title {
  font-size: 18px;
  font-weight: 700;
}
.modal__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #65686f;
  padding: 0 4px;
}
.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.modal__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 24px;
  border-top: 1px solid #e8eaed;
}
.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--ghost { background: #f0f1f3; color: #1c1f26; }
.btn--ghost:hover { background: #e8eaed; }
.btn--primary { background: #00b365; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #009955; }
</style>
