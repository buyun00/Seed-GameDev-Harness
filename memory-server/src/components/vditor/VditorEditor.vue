<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = withDefaults(defineProps<{
  modelValue: string
  mode?: 'ir' | 'sv' | 'wysiwyg'
  readonly?: boolean
  height?: string
}>(), {
  mode: 'ir',
  readonly: false,
  height: '300px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: []
}>()

const editorRef = ref<HTMLDivElement>()
let vditor: Vditor | null = null

onMounted(() => {
  if (!editorRef.value) return
  vditor = new Vditor(editorRef.value, {
    mode: props.mode,
    height: props.height,
    value: props.modelValue,
    cache: { enable: false },
    toolbar: props.readonly ? [] : [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', '|',
      'code', 'inline-code', 'quote', '|',
      'undo', 'redo',
    ],
    input: (value: string) => {
      emit('update:modelValue', value)
    },
    ctrlEnter: () => {
      emit('save')
    },
    after: () => {
      if (props.readonly) {
        vditor?.disabled()
      }
    },
  })
})

watch(() => props.modelValue, (val) => {
  if (vditor && vditor.getValue() !== val) {
    vditor.setValue(val)
  }
})

watch(() => props.readonly, (val) => {
  if (val) vditor?.disabled()
  else vditor?.enable()
})

onBeforeUnmount(() => {
  vditor?.destroy()
  vditor = null
})
</script>

<template>
  <div ref="editorRef" class="vditor-wrapper" />
</template>

<style scoped>
.vditor-wrapper {
  width: 100%;
}
</style>
