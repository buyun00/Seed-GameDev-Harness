<script setup lang="ts">
import { computed } from 'vue'
import { parseDiff } from '@/utils/diff'

const props = defineProps<{
  diff: string
  filePath: string
}>()

const lines = computed(() => parseDiff(props.diff))
</script>

<template>
  <div class="diff-viewer">
    <div class="diff-viewer__header">
      <code>{{ filePath }}</code>
    </div>
    <div class="diff-viewer__body">
      <table class="diff-table">
        <tbody>
          <tr
            v-for="(line, i) in lines"
            :key="i"
            :class="['diff-line', `diff-line--${line.type}`]"
          >
            <td class="diff-line__gutter diff-line__gutter--old">
              {{ line.type !== 'add' ? (line.oldLineNo ?? '') : '' }}
            </td>
            <td class="diff-line__gutter diff-line__gutter--new">
              {{ line.type !== 'remove' ? (line.newLineNo ?? '') : '' }}
            </td>
            <td class="diff-line__marker">
              {{ line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ' }}
            </td>
            <td class="diff-line__content">
              <pre>{{ line.content }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.diff-viewer {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
}
.diff-viewer__header {
  background: #f7f8fa;
  padding: 8px 16px;
  border-bottom: 1px solid #e8eaed;
  font-size: 12px;
}
.diff-viewer__body {
  overflow-x: auto;
}
.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
}
.diff-line--add { background: #e6ffec; }
.diff-line--remove { background: #ffebe9; }

.diff-line__gutter {
  width: 40px;
  text-align: right;
  padding: 0 6px;
  color: #9ca3af;
  user-select: none;
  border-right: 1px solid #e8eaed;
}
.diff-line__marker {
  width: 16px;
  text-align: center;
  padding: 0 4px;
  color: #65686f;
  user-select: none;
}
.diff-line--add .diff-line__marker { color: #00804a; }
.diff-line--remove .diff-line__marker { color: #cc3333; }

.diff-line__content {
  padding: 0 8px;
}
.diff-line__content pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>
