import { query as sdkQuery } from '@anthropic-ai/claude-agent-sdk'
import { spawnSync } from 'node:child_process'

export interface AgentQueryOptions {
  prompt: string
  systemPrompt?: string
  cwd?: string
  timeoutMs?: number
  signal?: AbortSignal
  disallowedTools?: string[]
  /** Label shown in terminal logs, e.g. "Constitution" */
  label?: string
  /** Called for each significant agent output chunk */
  onLog?: (msg: string) => void
}

export interface AgentBackendInfo {
  available: boolean
  label: string
  error?: string
}

let cachedClaudeExecutablePath: string | null | undefined

/**
 * Check if Claude Agent SDK is available.
 * Returns false if the module cannot be imported.
 */
export async function detectAgentBackend(): Promise<AgentBackendInfo> {
  return {
    available: true,
    label: 'Claude Agent SDK',
  }
}

export async function isAgentSDKAvailable(): Promise<boolean> {
  return true
}

export async function getAgentBackendLabel(): Promise<string> {
  return 'Claude Agent SDK'
}

/**
 * Run a query via Claude Agent SDK.
 */
export async function agentQuery(opts: AgentQueryOptions): Promise<string> {
  opts.onLog?.('Agent backend: Claude Agent SDK')
  return agentSDKQuery(opts)
}

async function agentSDKQuery(opts: AgentQueryOptions): Promise<string> {
  const ac = new AbortController()
  if (opts.signal) {
    opts.signal.addEventListener('abort', () => ac.abort())
  }
  const timeout = opts.timeoutMs
    ? setTimeout(() => ac.abort(), opts.timeoutMs)
    : null

  const prefix = opts.label ? `[${opts.label}]` : '[Agent]'

  function termLog(msg: string) {
    process.stderr.write(`${prefix} ${msg}\n`)
  }

  function forwardLog(msg: string) {
    termLog(msg)
    opts.onLog?.(msg)
  }

  try {
    const disallowedTools = opts.disallowedTools ?? [
      'Write', 'Edit', 'MultiEdit', 'Shell',
      'WebFetch', 'WebSearch', 'TodoWrite',
    ]
    const claudeExecutable = resolveClaudeExecutablePath()

    termLog('SDK mode started')
    termLog(`Claude executable: ${claudeExecutable}`)

    let result = ''
    const messages = sdkQuery({
      prompt: opts.prompt,
      options: {
        cwd: opts.cwd ?? process.cwd(),
        pathToClaudeCodeExecutable: claudeExecutable,
        disallowedTools,
        abortController: ac,
        ...(opts.systemPrompt ? { systemPrompt: opts.systemPrompt } : {}),
      },
    })

    for await (const message of messages) {
      const formatted = formatSdkMessage(message)
      if (formatted.logs.length > 0) {
        for (const line of formatted.logs) {
          forwardLog(line)
        }
      } else {
        const genericType = getMessageType(message)
        if (genericType && genericType !== 'user') {
          termLog(`[${genericType}]`)
        }
      }

      if (formatted.resultText) {
        result += formatted.resultText
      }
    }

    termLog('SDK query completed')
    return result
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function resolveClaudeExecutablePath(): string {
  if (cachedClaudeExecutablePath !== undefined) {
    return cachedClaudeExecutablePath ?? 'claude'
  }

  const explicit = process.env.CLAUDE_CODE_EXECUTABLE?.trim()
  if (explicit) {
    cachedClaudeExecutablePath = explicit
    return explicit
  }

  const command = process.platform === 'win32' ? 'where.exe' : 'which'
  const lookup = spawnSync(command, ['claude'], {
    encoding: 'utf-8',
    windowsHide: true,
  })

  const resolved = lookup.status === 0
    ? lookup.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => line.length > 0)
    : undefined

  cachedClaudeExecutablePath = resolved ?? 'claude'
  return cachedClaudeExecutablePath
}

function getMessageType(message: unknown): string | undefined {
  if (!message || typeof message !== 'object') {
    return undefined
  }
  const record = message as { type?: unknown }
  return typeof record.type === 'string' ? record.type : undefined
}

function formatSdkMessage(message: unknown): { logs: string[]; resultText: string } {
  if (!message || typeof message !== 'object') {
    return { logs: [], resultText: '' }
  }

  const msg = message as {
    type?: string
    content?: unknown
    name?: unknown
    input?: unknown
    result?: unknown
    subtype?: unknown
  }

  const logs: string[] = []
  let resultText = ''

  if (msg.type === 'assistant') {
    const blocks = normalizeContentBlocks(msg.content)
    for (const block of blocks) {
      if (block.kind === 'text') {
        if (block.text.trim()) {
          logs.push(...toLogLines(`assistant: ${block.text}`))
        }
        resultText += block.text
      } else if (block.kind === 'tool_use') {
        const renderedInput = stringifyForLog(block.input)
        logs.push(...toLogLines(`tool_use: ${block.name}${renderedInput ? ` ${renderedInput}` : ''}`))
      } else if (block.kind === 'other') {
        logs.push(...toLogLines(`assistant:${block.label} ${block.text}`))
      }
    }
    return { logs, resultText }
  }

  if (msg.type === 'tool_result') {
    const rendered = stringifyForLog(msg.content)
    logs.push(...toLogLines(`tool_result: ${rendered}`))
    return { logs, resultText }
  }

  if (msg.type === 'result') {
    const rawResult = msg.result ?? msg.content
    const rendered = stringifyForLog(rawResult)
    if (rendered) {
      logs.push(...toLogLines(`result: ${rendered}`))
      resultText += rendered
    }
    return { logs, resultText }
  }

  const rendered = stringifyForLog(msg.content)
  const typeLabel = msg.type ?? 'event'
  const subtype = typeof msg.subtype === 'string' ? `:${msg.subtype}` : ''
  const suffix = rendered ? ` ${rendered}` : ''
  logs.push(...toLogLines(`${typeLabel}${subtype}${suffix}`))
  return { logs, resultText }
}

function normalizeContentBlocks(content: unknown): Array<
  | { kind: 'text'; text: string }
  | { kind: 'tool_use'; name: string; input: unknown }
  | { kind: 'other'; label: string; text: string }
> {
  if (typeof content === 'string') {
    return [{ kind: 'text', text: content }]
  }

  if (!Array.isArray(content)) {
    return content == null ? [] : [{ kind: 'other', label: 'content', text: stringifyForLog(content) }]
  }

  const blocks: Array<
    | { kind: 'text'; text: string }
    | { kind: 'tool_use'; name: string; input: unknown }
    | { kind: 'other'; label: string; text: string }
  > = []

  for (const rawBlock of content) {
    if (!rawBlock || typeof rawBlock !== 'object') {
      blocks.push({ kind: 'other', label: 'block', text: stringifyForLog(rawBlock) })
      continue
    }

    const block = rawBlock as {
      type?: unknown
      text?: unknown
      name?: unknown
      input?: unknown
    }

    if (block.type === 'text' && typeof block.text === 'string') {
      blocks.push({ kind: 'text', text: block.text })
      continue
    }

    if (block.type === 'tool_use' && typeof block.name === 'string') {
      blocks.push({ kind: 'tool_use', name: block.name, input: block.input })
      continue
    }

    blocks.push({
      kind: 'other',
      label: typeof block.type === 'string' ? block.type : 'block',
      text: stringifyForLog(rawBlock),
    })
  }

  return blocks
}

function stringifyForLog(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value == null) {
    return ''
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function toLogLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trimEnd())
    .filter(line => line.trim().length > 0)
}
