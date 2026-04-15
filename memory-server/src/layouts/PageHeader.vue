<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__text">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px 0;
}
.page-header__title {
  font-size: 22px;
  font-weight: 700;
  color: #1c1f26;
  line-height: 1.3;
}
.page-header__subtitle {
  font-size: 13px;
  color: #65686f;
  margin-top: 2px;
}
.page-header__actions {
  display: flex;
  gap: 8px;
}
</style>
