<script setup lang="ts">
import { useConstitutionStore } from '@/stores/constitution'
import { useAnalysisStatus } from '@/composables/useAnalysisStatus'

const store = useConstitutionStore()
const { statusType, statusText } = useAnalysisStatus()

defineEmits<{ analyze: [] }>()
</script>

<template>
  <div class="analysis-banner-wrapper">
    <!-- 文件更新醒目提示条 -->
    <div v-if="store.analysisStatus === 'outdated'" class="update-alert">
      <span class="update-alert__icon">⚠</span>
      <div class="update-alert__body">
        <span class="update-alert__title">检测到源文件已更新，分析结果已过期</span>
        <span class="update-alert__files">
          已变更：{{ store.changedFiles.join('、') }}
        </span>
      </div>
      <button
        class="banner-btn banner-btn--alert"
        :disabled="store.analyzing"
        @click="$emit('analyze')"
      >
        {{ store.analyzing ? '分析中...' : '立即重新分析' }}
      </button>
      <span v-if="store.analyzing" class="analysis-banner__spinner" />
    </div>

    <!-- 常规状态条 -->
    <div :class="['analysis-banner', `analysis-banner--${statusType}`]">
      <div class="analysis-banner__content">
        <span class="analysis-banner__icon">
          {{ statusType === 'success' ? '✓' : statusType === 'warning' ? '⚠' : 'ℹ' }}
        </span>
        <span class="analysis-banner__text">{{ statusText }}</span>
      </div>
      <div class="analysis-banner__actions">
        <!-- 首次分析 -->
        <button
          v-if="store.analysisStatus === 'none'"
          class="banner-btn banner-btn--primary"
          :disabled="store.analyzing"
          @click="$emit('analyze')"
        >
          {{ store.analyzing ? '分析中...' : 'Run First Analysis' }}
        </button>
        <!-- 已有分析结果时始终显示重新分析按钮 -->
        <button
          v-else
          :class="['banner-btn', store.analysisStatus === 'outdated' ? 'banner-btn--warning' : 'banner-btn--secondary']"
          :disabled="store.analyzing"
          @click="$emit('analyze')"
        >
          {{ store.analyzing ? '分析中...' : 'Re-run Analysis' }}
        </button>
        <span v-if="store.analyzing" class="analysis-banner__spinner" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-banner-wrapper {
  display: flex;
  flex-direction: column;
}

/* 文件更新醒目提示条 */
.update-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 28px;
  background: #fff3e0;
  border-left: 4px solid #e65c00;
  border-bottom: 1px solid #ffd599;
  animation: pulse-border 2s ease-in-out infinite;
}
@keyframes pulse-border {
  0%, 100% { border-left-color: #e65c00; }
  50% { border-left-color: #ff8c00; }
}
.update-alert__icon {
  font-size: 18px;
  color: #e65c00;
  flex-shrink: 0;
}
.update-alert__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.update-alert__title {
  font-size: 13px;
  font-weight: 600;
  color: #b34500;
}
.update-alert__files {
  font-size: 12px;
  color: #8a4500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 常规状态条 */
.analysis-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 28px;
  font-size: 13px;
  gap: 12px;
}
.analysis-banner--info { background: #e8f0fe; color: #1a5bc7; }
.analysis-banner--success { background: #e6f7ee; color: #00804a; }
.analysis-banner--warning { background: #fff8f0; color: #b36b00; }

.analysis-banner__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.analysis-banner__icon { font-size: 15px; }
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
.banner-btn--secondary { background: #f0f0f0; color: #333; border: 1px solid #d0d0d0; }
.banner-btn--secondary:hover:not(:disabled) { background: #e4e4e4; }
.banner-btn--alert { background: #e65c00; color: #fff; flex-shrink: 0; padding: 5px 16px; }
.banner-btn--alert:hover:not(:disabled) { background: #cc5200; }
</style>
