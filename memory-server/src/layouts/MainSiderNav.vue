<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useAppStore, languageOptions } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const appStore = useAppStore()

const showLangMenu = ref(false)

const navItems = computed(() => [
  { key: 'studio', label: i18n.value.navStudio, icon: '🎪' },
  { key: 'constitution', label: i18n.value.navConstitution, icon: '⚖' },
  { key: 'auto-memory', label: i18n.value.navAutoMemory, icon: '🧠' },
  { key: 'project-knowledge', label: i18n.value.navKnowledge, icon: '📚' },
])

const activeKey = computed(() => route.name as string)

const currentLangOption = computed(() => {
  return languageOptions.find(opt => opt.code === appStore.language) || languageOptions[0]
})

function navigate(key: string) {
  router.push({ name: key })
}

function selectLanguage(code: string) {
  appStore.setLanguage(code as any)
  showLangMenu.value = false
}

function toggleLangMenu() {
  showLangMenu.value = !showLangMenu.value
}

function closeLangMenu() {
  showLangMenu.value = false
}
</script>

<template>
  <nav class="sider-nav">
    <div class="sider-nav__header">
      <span class="sider-nav__logo">S</span>
      <span class="sider-nav__title">{{ i18n.SEED }}</span>
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
        <span v-if="activeKey === item.key" class="sider-nav__indicator" />
      </li>
    </ul>
    <div class="sider-nav__footer">
      <div class="lang-selector" @click="toggleLangMenu">
        <span class="lang-selector__flag">{{ currentLangOption.flag }}</span>
        <span class="lang-selector__label">{{ currentLangOption.label }}</span>
        <span class="lang-selector__arrow">{{ showLangMenu ? '▲' : '▼' }}</span>
      </div>
      <div v-if="showLangMenu" class="lang-menu" @click.stop>
        <button
          v-for="lang in languageOptions"
          :key="lang.code"
          :class="['lang-menu__item', { 'lang-menu__item--active': lang.code === appStore.language }]"
          @click="selectLanguage(lang.code)"
        >
          <span class="lang-menu__flag">{{ lang.flag }}</span>
          <span class="lang-menu__label">{{ lang.label }}</span>
        </button>
      </div>
      <button class="theme-toggle" @click="appStore.toggleTheme()">
        <span class="theme-toggle__icon">{{ appStore.theme === 'dark' ? '☀️' : '🌙' }}</span>
        <span class="theme-toggle__label">{{ appStore.theme === 'dark' ? '浅色模式' : '深色模式' }}</span>
      </button>
      <span class="sider-nav__version">v0.7.0</span>
    </div>
  </nav>
</template>

<style scoped>
.sider-nav {
  width: 220px;
  min-width: 220px;
  background: var(--sider-bg);
  color: var(--sider-text);
  display: flex;
  flex-direction: column;
  user-select: none;
  position: relative;
  border-right: 1px solid var(--sider-border);
  transition: background 0.3s ease, color 0.3s ease;
}
.sider-nav__header {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--sider-border);
}
.sider-nav__logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  box-shadow: var(--glow-cyan);
}
.sider-nav__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, var(--sider-text), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sider-nav__list {
  list-style: none;
  padding: 8px 0;
  flex: 1;
}
.sider-nav__item {
  padding: 10px 16px;
  margin: 2px 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
}
.sider-nav__item:hover {
  background: var(--border-color);
}
.sider-nav__item--active {
  background: rgba(0, 245, 212, 0.08);
  color: var(--accent-cyan);
}
.sider-nav__item--active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent-cyan);
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px var(--accent-cyan);
}
.sider-nav__icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
.sider-nav__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--sider-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sider-nav__version {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-top: 4px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
  border: none;
  background: transparent;
  color: var(--sider-text);
  width: 100%;
  text-align: left;
}
.theme-toggle:hover {
  background: var(--border-color);
}
.theme-toggle__icon {
  font-size: 14px;
}
.theme-toggle__label {
  color: var(--text-secondary);
}

.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.lang-selector:hover {
  background: var(--border-color);
}
.lang-selector__flag {
  font-size: 14px;
}
.lang-selector__label {
  flex: 1;
  text-align: left;
  color: var(--text-secondary);
}
.lang-selector__arrow {
  font-size: 10px;
  color: var(--text-muted);
}

.lang-menu {
  position: absolute;
  bottom: 100px;
  left: 16px;
  right: 16px;
  background: var(--bg-elevated);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}
.lang-menu__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--sider-text);
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
.lang-menu__item:hover {
  background: var(--border-color);
}
.lang-menu__item--active {
  background: rgba(0, 245, 212, 0.1);
  color: var(--accent-cyan);
}
.lang-menu__flag {
  font-size: 14px;
}
</style>
