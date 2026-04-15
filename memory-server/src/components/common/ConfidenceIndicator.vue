<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number }>()

const percent = computed(() => Math.round(props.value * 100))
const color = computed(() => {
  if (props.value >= 0.8) return '#00b365'
  if (props.value >= 0.5) return '#f59e0b'
  return '#ef4444'
})
</script>

<template>
  <span class="confidence" :title="`Confidence: ${percent}%`">
    <span class="confidence__bar">
      <span class="confidence__fill" :style="{ width: `${percent}%`, background: color }" />
    </span>
    <span class="confidence__text">{{ percent }}%</span>
  </span>
</template>

<style scoped>
.confidence {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.confidence__bar {
  width: 48px;
  height: 4px;
  background: #e8eaed;
  border-radius: 2px;
  overflow: hidden;
}
.confidence__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.confidence__text {
  font-size: 12px;
  color: #65686f;
}
</style>
