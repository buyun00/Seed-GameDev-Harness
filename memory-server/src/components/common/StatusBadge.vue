<script setup lang="ts">
import { computed } from 'vue'
import { statusColor } from '@/utils/format'
import { useI18n } from '@/i18n'

const props = defineProps<{ status: string }>()

const color = computed(() => statusColor(props.status))
const i18n = useI18n()
</script>

<template>
  <span class="status-badge" :data-color="color">
    {{ i18n.statusLabel(status) }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}
.status-badge[data-color="green"] { background: #e6f7ee; color: #00804a; }
.status-badge[data-color="orange"] { background: #fff3e0; color: #b36b00; }
.status-badge[data-color="red"] { background: #ffeaea; color: #cc3333; }
.status-badge[data-color="blue"] { background: #e8f0fe; color: #1a5bc7; }
.status-badge[data-color="grey"] { background: #f0f1f3; color: #65686f; }
</style>
