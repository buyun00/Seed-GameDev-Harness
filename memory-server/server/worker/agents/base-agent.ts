import { llmProvider } from '../../core/llm-provider.js'
import type { ChatMessage } from '../../core/llm-provider.js'

export interface AgentQueryOptions {
  prompt: string
  systemPrompt?: string
  cwd?: string
  timeoutMs?: number
  signal?: AbortSignal
  disallowedTools?: string[]
  label?: string
  onLog?: (msg: string) => void
}

export interface AgentBackendInfo {
  available: boolean
  label: string
  error?: string
}

export async function detectAgentBackend(): Promise<AgentBackendInfo> {
  const config = llmProvider.getActiveConfig()
  if (!config) {
    return {
      available: false,
      label: 'No LLM configured',
      error: 'Please configure an API key in the settings',
    }
  }
  return {
    available: true,
    label: `${config.provider} (${config.model || 'default'})`,
  }
}

export async function isAgentSDKAvailable(): Promise<boolean> {
  return !!llmProvider.getActiveConfig()
}

export async function getAgentBackendLabel(): Promise<string> {
  const config = llmProvider.getActiveConfig()
  if (!config) return 'No LLM configured'
  return `${config.provider} (${config.model || 'default'})`
}

export async function agentQuery(opts: AgentQueryOptions): Promise<string> {
  const config = llmProvider.getActiveConfig()
  if (!config) {
    throw new Error('No active LLM configuration. Please set an API key in the settings.')
  }

  opts.onLog?.(`Agent backend: ${config.provider} (${config.model || 'default'})`)

  const messages: ChatMessage[] = []
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt })
  }
  messages.push({ role: 'user', content: opts.prompt })

  const prefix = opts.label ? `[${opts.label}]` : '[Agent]'

  let fullResult = ''
  await llmProvider.chat({
    messages,
    signal: opts.signal,
    onChunk: (text) => {
      fullResult += text
    },
  })

  opts.onLog?.(`${prefix} Query completed (${fullResult.length} chars)`)
  return fullResult
}
