<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps<{
  content: string
}>()

const previewRef = ref<HTMLDivElement>()

async function render() {
  if (!previewRef.value) return
  await Vditor.preview(previewRef.value, props.content, {
    mode: 'light',
    hljs: { lineNumber: true },
  })
}

onMounted(render)
watch(() => props.content, render)
</script>

<template>
  <div ref="previewRef" class="vditor-preview-wrapper" />
</template>

<style scoped>
.vditor-preview-wrapper {
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.7;
}
</style>
