<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchLlmConfigs, saveLlmConfig, activateLlmConfig, deleteLlmConfig } from '@/api/llm'
import type { LlmConfig } from '@/api/llm'
import ProviderIcon from '@/components/common/ProviderIcon.vue'

const emit = defineEmits<{
  close: []
  configChanged: [activeKey: string, config: LlmConfig | null]
}>()

const configs = ref<Array<{ key: string; config: LlmConfig }>>([])
const activeKey = ref('')
const loading = ref(true)
const showForm = ref(false)
const editingKey = ref('')
const editProvider = ref('openai')
const editApiKey = ref('')
const editModel = ref('')
const editBaseUrl = ref('')
const editName = ref('')
const saveError = ref('')
const saving = ref(false)

interface ProviderInfo {
  value: string
  label: string
  keyUrl: string
  docUrl: string
  defaultModel: string
  defaultBaseUrl: string
}

const providers: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', docUrl: 'https://platform.openai.com/docs', defaultModel: 'gpt-4o', defaultBaseUrl: 'https://api.openai.com/v1' },
  { value: 'anthropic', label: 'Anthropic', keyUrl: 'https://console.anthropic.com/settings/keys', docUrl: 'https://docs.anthropic.com', defaultModel: 'claude-sonnet-4-20250514', defaultBaseUrl: 'https://api.anthropic.com/v1' },
  { value: 'gemini', label: 'Gemini', keyUrl: 'https://aistudio.google.com/app/apikey', docUrl: 'https://ai.google.dev/docs', defaultModel: 'gemini-2.5-flash', defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { value: 'deepseek', label: 'DeepSeek', keyUrl: 'https://platform.deepseek.com/api_keys', docUrl: 'https://platform.deepseek.com/docs', defaultModel: 'deepseek-chat', defaultBaseUrl: 'https://api.deepseek.com/v1' },
  { value: 'qwen', label: '通义千问', keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1', docUrl: 'https://help.aliyun.com/zh/model-studio/', defaultModel: 'qwen-plus', defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { value: 'custom', label: '自定义', keyUrl: '', docUrl: '', defaultModel: 'gpt-4o', defaultBaseUrl: '' },
]

const providerMap = new Map(providers.map(p => [p.value, p]))

async function loadConfigs() {
  loading.value = true
  try {
    const data = await fetchLlmConfigs()
    configs.value = data.configs
    activeKey.value = data.activeKey
  } catch {
  } finally {
    loading.value = false
  }
}

function emitChange() {
  const active = configs.value.find(c => c.key === activeKey.value)
  emit('configChanged', activeKey.value, active?.config ?? null)
}

function startAdd() {
  showForm.value = true
  editingKey.value = ''
  editProvider.value = 'openai'
  editName.value = ''
  editApiKey.value = ''
  editModel.value = ''
  editBaseUrl.value = ''
  saveError.value = ''
}

function startEdit(item: { key: string; config: LlmConfig }) {
  showForm.value = true
  editingKey.value = item.key
  editProvider.value = item.config.provider
  editName.value = item.key
  editApiKey.value = ''
  editModel.value = item.config.model || ''
  editBaseUrl.value = item.config.baseUrl || ''
  saveError.value = ''
}

function cancelForm() {
  showForm.value = false
  saveError.value = ''
}

watch(editProvider, (newVal) => {
  if (!editingKey.value) {
    editModel.value = providerMap.get(newVal)?.defaultModel ?? ''
    editBaseUrl.value = providerMap.get(newVal)?.defaultBaseUrl ?? ''
  }
})

async function handleSave() {
  const key = editingKey.value || editName.value.trim()
  if (!key) {
    saveError.value = '请输入配置名称'
    return
  }
  if (!editApiKey.value.trim() && !configs.value.find(c => c.key === key)) {
    saveError.value = '请输入 API Key'
    return
  }

  saving.value = true
  saveError.value = ''
  try {
    const existing = configs.value.find(c => c.key === key)
    await saveLlmConfig({
      key,
      provider: editProvider.value,
      apiKey: editApiKey.value || existing?.config.apiKey || '',
      model: editModel.value || providerMap.get(editProvider.value)?.defaultModel || '',
      baseUrl: editBaseUrl.value || undefined,
    })
    await loadConfigs()
    showForm.value = false
    emitChange()
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : String(err)
  } finally {
    saving.value = false
  }
}

async function handleActivate(key: string) {
  try {
    await activateLlmConfig(key)
    activeKey.value = key
    emitChange()
  } catch {}
}

async function handleDelete(key: string) {
  try {
    await deleteLlmConfig(key)
    if (activeKey.value === key) activeKey.value = ''
    await loadConfigs()
    emitChange()
  } catch {}
}

function openKeyUrl(provider: string) {
  const info = providerMap.get(provider)
  if (info?.keyUrl) window.open(info.keyUrl, '_blank')
}

onMounted(() => {
  loadConfigs()
})
</script>

<template>
  <div class="settings-overlay" @click.self="emit('close')">
    <div class="settings-panel">
      <div class="settings-panel__header">
        <div class="settings-panel__header-left">
          <span class="settings-panel__title">⚙️ 模型管理</span>
          <span class="settings-panel__subtitle">管理 AI 模型供应商与 API Key</span>
        </div>
        <button class="settings-panel__close" @click="emit('close')">✕</button>
      </div>

      <div class="settings-panel__body">
        <div v-if="loading" class="settings-panel__loading">加载中...</div>

        <template v-else>
          <!-- Configured models -->
          <div class="config-section">
            <div class="config-section__header">
              <h3 class="section-title">已配置的模型 ({{ configs.length }})</h3>
              <button v-if="!showForm" class="add-btn" @click="startAdd">+ 添加模型</button>
            </div>
            <div v-if="configs.length === 0" class="config-empty">
              尚未配置任何模型，点击上方按钮添加
            </div>
            <div v-else class="config-list">
              <div
                v-for="item in configs"
                :key="item.key"
                :class="['config-item', { 'config-item--active': item.key === activeKey }]"
              >
                <div class="config-item__left">
                  <span class="config-item__icon"><ProviderIcon :provider="item.config.provider" :size="20" /></span>
                  <div class="config-item__info">
                    <span class="config-item__name">{{ item.key }}</span>
                    <span class="config-item__meta">
                      {{ providerMap.get(item.config.provider)?.label || item.config.provider }}
                      · {{ item.config.model }}
                    </span>
                  </div>
                </div>
                <div class="config-item__right">
                  <span v-if="item.key === activeKey" class="config-item__tag">当前</span>
                  <button
                    v-if="item.key !== activeKey"
                    class="config-item__btn config-item__btn--activate"
                    @click="handleActivate(item.key)"
                  >激活</button>
                  <button class="config-item__btn" @click="startEdit(item)">编辑</button>
                  <button class="config-item__btn config-item__btn--delete" @click="handleDelete(item.key)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Inline add/edit form -->
          <div v-if="showForm" class="form-section">
            <h3 class="section-title">{{ editingKey ? '编辑配置' : '添加模型' }}</h3>
            <div class="form-body">
              <div class="form-row">
                <div class="form-field form-field--half">
                  <label class="form-field__label">供应商</label>
                  <select v-model="editProvider" class="form-field__select" :disabled="!!editingKey">
                    <option v-for="p in providers" :key="p.value" :value="p.value"><ProviderIcon :provider="p.value" :size="14" /> {{ p.label }}</option>
                  </select>
                </div>
                <div class="form-field form-field--half">
                  <label class="form-field__label">配置名称</label>
                  <input v-model="editName" class="form-field__input" placeholder="如: 我的模型" :disabled="!!editingKey" />
                </div>
              </div>

              <div class="form-field">
                <label class="form-field__label">API Key</label>
                <div class="form-field__key-row">
                  <input
                    v-model="editApiKey"
                    type="password"
                    class="form-field__input"
                    :placeholder="editingKey ? '留空则不修改' : '输入 API Key'"
                  />
                  <button v-if="providerMap.get(editProvider)?.keyUrl" class="form-field__key-btn" @click="openKeyUrl(editProvider)">
                    🔑 获取
                  </button>
                </div>
                <p v-if="providerMap.get(editProvider)?.keyUrl" class="form-field__hint">
                  前往 <a :href="providerMap.get(editProvider)!.keyUrl" target="_blank" class="form-field__link">{{ providerMap.get(editProvider)?.label }} 控制台</a> 创建 API Key
                </p>
              </div>

              <div class="form-row">
                <div class="form-field form-field--half">
                  <label class="form-field__label">模型名称</label>
                  <input v-model="editModel" class="form-field__input" :placeholder="providerMap.get(editProvider)?.defaultModel" />
                </div>
                <div class="form-field form-field--half">
                  <label class="form-field__label">API 地址</label>
                  <input v-model="editBaseUrl" class="form-field__input" placeholder="https://api.openai.com/v1" />
                </div>
              </div>

              <div v-if="saveError" class="form-field__error">{{ saveError }}</div>

              <div class="form-actions">
                <button class="form-actions__btn form-actions__btn--cancel" @click="cancelForm">取消</button>
                <button class="form-actions__btn form-actions__btn--save" :disabled="saving" @click="handleSave">
                  {{ saving ? '保存中...' : '保存配置' }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.settings-panel {
  background: var(--bg-elevated);
  border-radius: 12px;
  width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-color);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.settings-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}
.settings-panel__header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.settings-panel__title {
  font-weight: 600;
  font-size: 17px;
  color: var(--text-primary);
}
.settings-panel__subtitle {
  font-size: 13px;
  color: var(--text-muted);
}
.settings-panel__close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.settings-panel__close:hover {
  background: var(--border-color);
  color: var(--text-primary);
}
.settings-panel__body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}
.settings-panel__loading {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}

/* Section */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

/* Config section */
.config-section {
  margin-bottom: 16px;
}
.config-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.config-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 24px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  font-size: 13px;
}
.config-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.15s;
}
.config-item:hover {
  border-color: var(--border-visible);
}
.config-item--active {
  border-color: var(--accent-cyan);
  background: rgba(0, 245, 212, 0.04);
}
.config-item__left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.config-item__icon { font-size: 20px; }
.config-item__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.config-item__name {
  font-weight: 500;
  font-size: 13px;
  color: var(--text-primary);
}
.config-item__meta {
  font-size: 11px;
  color: var(--text-muted);
}
.config-item__right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.config-item__tag {
  font-size: 10px;
  color: #0a0a0f;
  background: var(--accent-cyan);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.config-item__btn {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.config-item__btn:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
}
.config-item__btn--activate {
  color: var(--accent-cyan);
  border-color: rgba(0, 245, 212, 0.2);
}
.config-item__btn--activate:hover {
  background: rgba(0, 245, 212, 0.08);
}
.config-item__btn--delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}
.config-item__btn--delete:hover {
  background: rgba(239, 68, 68, 0.08);
}
.add-btn {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid rgba(0, 245, 212, 0.2);
  background: transparent;
  color: var(--accent-cyan);
  transition: all 0.15s;
  font-weight: 500;
}
.add-btn:hover {
  background: rgba(0, 245, 212, 0.08);
}

/* Form */
.form-section {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
.form-body {
  margin-top: 12px;
}
.form-row {
  display: flex;
  gap: 10px;
}
.form-field {
  margin-bottom: 14px;
}
.form-field--half {
  flex: 1;
}
.form-field__label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 5px;
}
.form-field__input, .form-field__select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s;
  font-family: inherit;
}
.form-field__input::placeholder { color: var(--text-muted); }
.form-field__input:focus, .form-field__select:focus { border-color: var(--accent-cyan); }
.form-field__input:disabled { opacity: 0.5; cursor: not-allowed; }
.form-field__select option { background: var(--bg-elevated); color: var(--text-primary); }
.form-field__hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 0;
}
.form-field__link {
  color: var(--accent-cyan);
  text-decoration: none;
}
.form-field__link:hover { text-decoration: underline; }
.form-field__key-row {
  display: flex;
  gap: 6px;
}
.form-field__key-row .form-field__input { flex: 1; }
.form-field__key-btn {
  padding: 8px 12px;
  border: 1px solid rgba(0, 245, 212, 0.2);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: var(--accent-cyan);
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.15s;
}
.form-field__key-btn:hover { background: rgba(0, 245, 212, 0.08); }
.form-field__error {
  color: #ef4444;
  font-size: 13px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  margin-bottom: 12px;
}
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
}
.form-actions__btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.15s;
}
.form-actions__btn--cancel {
  background: var(--border-color);
  color: var(--text-secondary);
}
.form-actions__btn--cancel:hover { background: rgba(255, 255, 255, 0.08); }
.form-actions__btn--save {
  background: linear-gradient(135deg, var(--accent-cyan), #00c9a7);
  color: #0a0a0f;
}
.form-actions__btn--save:hover:not(:disabled) { box-shadow: 0 0 12px rgba(0, 245, 212, 0.3); }
.form-actions__btn--save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
