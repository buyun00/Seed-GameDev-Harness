<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { key: 'constitution', label: 'Constitution', icon: '⚖' },
  { key: 'auto-memory', label: 'Auto Memory', icon: '🧠' },
  { key: 'project-knowledge', label: 'Knowledge', icon: '📚' },
]

const activeKey = computed(() => route.name as string)

function navigate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <nav class="sider-nav">
    <div class="sider-nav__header">
      <span class="sider-nav__logo">S</span>
      <span class="sider-nav__title">Memory Editor</span>
    </div>
    <ul class="sider-nav__list">
      <li
        v-for="item in navItems"
        :key="item.key"
        :class="['sider-nav__item', { 'sider-nav__item--active': activeKey === item.key }]"
        @click="navigate(item.key)"
      >
        <span class="sider-nav__icon">{{ item.icon }}</span>
        <span class="sider-nav__label">{{ item.label }}</span>
      </li>
    </ul>
    <div class="sider-nav__footer">
      <span class="sider-nav__version">v0.1.0</span>
    </div>
  </nav>
</template>

<style scoped>
.sider-nav {
  width: 220px;
  min-width: 220px;
  background: #1c1f26;
  color: #e8eaed;
  display: flex;
  flex-direction: column;
  user-select: none;
}
.sider-nav__header {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sider-nav__logo {
  width: 32px;
  height: 32px;
  background: #00b365;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
}
.sider-nav__title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.sider-nav__list {
  list-style: none;
  padding: 8px 0;
  flex: 1;
}
.sider-nav__item {
  padding: 10px 16px;
  margin: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: background 0.15s;
}
.sider-nav__item:hover {
  background: rgba(255,255,255,0.06);
}
.sider-nav__item--active {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.sider-nav__icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
.sider-nav__footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.sider-nav__version {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
}
</style>
