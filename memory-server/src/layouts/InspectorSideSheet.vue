<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  width?: string
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="slide">
    <div v-if="visible" class="inspector" :style="{ width: width || '400px' }">
      <div class="inspector__header">
        <h3 class="inspector__title">{{ title }}</h3>
        <button class="inspector__close" @click="$emit('close')">&times;</button>
      </div>
      <div class="inspector__body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="inspector__footer">
        <slot name="footer" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.inspector {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.inspector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaed;
}
.inspector__title {
  font-size: 16px;
  font-weight: 600;
}
.inspector__close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #65686f;
  padding: 0 4px;
}
.inspector__close:hover {
  color: #1c1f26;
}
.inspector__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.inspector__footer {
  padding: 12px 20px;
  border-top: 1px solid #e8eaed;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
