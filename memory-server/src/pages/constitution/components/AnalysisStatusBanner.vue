<script setup lang="ts">
import { useConstitutionStore } from '@/stores/constitution'
import { useAnalysisStatus } from '@/composables/useAnalysisStatus'

const store = useConstitutionStore()
const { statusType, statusText } = useAnalysisStatus()

defineEmits<{ analyze: [] }>()
</script>

<template>
  <div :class="['analysis-banner', `analysis-banner--${statusType}`]">
    <div class="analysis-banner__content">
      <span class="analysis-banner__icon">
        {{ statusType === 'success' ? '✓' : statusType === 'warning' ? '⚠' : 'ℹ' }}
      </span>
      <span class="analysis-banner__text">{{ statusText }}</span>
      <span v-if="store.changedFiles.length" class="analysis-banner__files">
        Changed: {{ store.changedFiles.join(', ') }}
      </span>
    </div>
    <div class="analysis-banner__actions">
      <button
        v-if="store.analysisStatus === 'none'"
        class="banner-btn banner-btn--primary"
        :disabled="store.analyzing"
        @click="$emit('analyze')"
      >
        Run First Analysis
      </button>
      <button
        v-if="store.analysisStatus === 'outdated'"
        class="banner-btn banner-btn--warning"
        :disabled="store.analyzing"
        @click="$emit('analyze')"
      >
        Re-run Analysis
      </button>
      <span v-if="store.analyzing" class="analysis-banner__spinner" />
    </div>
  </div>
</template>

<style scoped>
.analysis-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 28px;
  font-size: 13px;
  gap: 12px;
}
.analysis-banner--info { background: #e8f0fe; color: #1a5bc7; }
.analysis-banner--success { background: #e6f7ee; color: #00804a; }
.analysis-banner--warning { background: #fff3e0; color: #b36b00; }

.analysis-banner__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.analysis-banner__icon { font-size: 15px; }
.analysis-banner__files {
  font-size: 12px;
  opacity: 0.8;
}
.analysis-banner__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.analysis-banner__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.banner-btn {
  padding: 4px 14px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.banner-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.banner-btn--primary { background: #1a5bc7; color: #fff; }
.banner-btn--primary:hover:not(:disabled) { background: #1550b3; }
.banner-btn--warning { background: #b36b00; color: #fff; }
.banner-btn--warning:hover:not(:disabled) { background: #995c00; }
</style>
