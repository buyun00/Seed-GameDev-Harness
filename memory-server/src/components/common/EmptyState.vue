<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon">📭</slot>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}
.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}
.empty-state__title {
  font-size: 16px;
  font-weight: 600;
  color: #1c1f26;
  margin-bottom: 6px;
}
.empty-state__desc {
  font-size: 13px;
  color: #65686f;
  max-width: 360px;
}
.empty-state__action {
  margin-top: 20px;
}
</style>
