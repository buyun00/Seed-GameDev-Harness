<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AppLayout from '@/layouts/AppLayout.vue'

const appStore = useAppStore()
onMounted(() => appStore.initialize())
</script>

<template>
  <div v-if="appStore.loading" class="app-loading">
    <div class="app-loading__spinner" />
    <p>Connecting to Memory Server...</p>
  </div>
  <AppLayout v-else />
</template>

<style scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: #65686f;
}
.app-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8eaed;
  border-top-color: #1c1f26;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
