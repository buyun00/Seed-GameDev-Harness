<script setup lang="ts">
import { computed } from 'vue'
import { useConstitutionStore } from '@/stores/constitution'
import { useAnalysisStatus } from '@/composables/useAnalysisStatus'
import { useI18n } from '@/i18n'

const store = useConstitutionStore()
const { statusType, statusText } = useAnalysisStatus()
const i18n = useI18n()

const changedFilesText = computed(() => store.changedFiles.join(', '))

defineEmits<{ analyze: [] }>()
</script>

<template>
  <div :class="['analysis-banner', `analysis-banner--${statusType}`]">
    <div class="analysis-banner__content">
      <span class="analysis-banner__icon">
        {{ statusType === 'success' ? 'OK' : statusType === 'warning' ? '!' : 'i' }}
      </span>
      <div class="analysis-banner__text-group">
        <span class="analysis-banner__text">{{ statusText }}</span>
        <span
          v-if="store.analysisStatus === 'outdated' && store.changedFiles.length > 0"
          class="analysis-banner__detail"
        >
          {{ i18n.changedFiles }} {{ changedFilesText }}
        </span>
      </div>
    </div>
    <div class="analysis-banner__actions">
      <button
        v-if="store.analysisStatus === 'none'"
        class="banner-btn banner-btn--primary"
        :disabled="store.analyzing"
        @click="$emit('analyze')"
      >
        {{ store.analyzing ? i18n.analyzing : i18n.runFirstAnalysis }}
      </button>
      <button
        v-else
        :class="['banner-btn', store.analysisStatus === 'outdated' ? 'banner-btn--warning' : 'banner-btn--secondary']"
        :disabled="store.analyzing"
        @click="$emit('analyze')"
      >
        {{ store.analyzing ? i18n.analyzing : store.analysisStatus === 'outdated' ? i18n.reanalyzeNow : i18n.rerunAnalysis }}
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

.analysis-banner--info {
  background: #e8f0fe;
  color: #1a5bc7;
}

.analysis-banner--success {
  background: #e6f7ee;
  color: #00804a;
}

.analysis-banner--warning {
  background: #fff3e0;
  color: #b34500;
  border-left: 4px solid #e65c00;
}

.analysis-banner__content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.analysis-banner__icon {
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  flex-shrink: 0;
}

.analysis-banner__text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.analysis-banner__text {
  line-height: 1.4;
}

.analysis-banner__detail {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.analysis-banner__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.analysis-banner__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

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

.banner-btn--primary {
  background: #1a5bc7;
  color: #fff;
}

.banner-btn--primary:hover:not(:disabled) {
  background: #1550b3;
}

.banner-btn--warning {
  background: #b36b00;
  color: #fff;
}

.banner-btn--warning:hover:not(:disabled) {
  background: #995c00;
}

.banner-btn--secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #d0d0d0;
}

.banner-btn--secondary:hover:not(:disabled) {
  background: #e4e4e4;
}

@media (max-width: 768px) {
  .analysis-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .analysis-banner__actions {
    justify-content: flex-start;
  }

  .analysis-banner__detail {
    white-space: normal;
  }
}
</style>
