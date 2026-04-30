<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from '@/i18n'
import AppLayout from '@/layouts/AppLayout.vue'

const appStore = useAppStore()
const i18n = useI18n()
onMounted(() => appStore.initialize())
</script>

<template>
  <div v-if="appStore.loading" class="app-loading">
    <div class="app-loading__logo">S</div>
    <div class="app-loading__spinner" />
    <p class="app-loading__text">{{ i18n.connectingToServer }}</p>
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
  gap: 20px;
  background: #0a0a0f;
  position: relative;
  overflow: hidden;
}
.app-loading::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(0, 245, 212, 0.06) 0%, transparent 60%);
  animation: loadingPulse 2s ease-in-out infinite;
}
@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
.app-loading__logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00f5d4, #7c3aed);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 0 30px rgba(0, 245, 212, 0.2);
  animation: logoFloat 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.app-loading__spinner {
  width: 2px;
  height: 40px;
  background: linear-gradient(to top, transparent, #00f5d4);
  border-radius: 1px;
  animation: spinnerGrow 1.2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}
@keyframes spinnerGrow {
  0%, 100% { transform: scaleY(0.3); opacity: 0.3; }
  50% { transform: scaleY(1); opacity: 1; }
}
.app-loading__text {
  color: #94a3b8;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  animation: textFade 1.5s ease-in-out infinite;
}
@keyframes textFade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
