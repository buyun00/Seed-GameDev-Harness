import { spawn } from 'node:child_process'

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

/**
 * Check if Claude Agent SDK is available.
 * Returns false if the module cannot be imported.
 */
export async function isAgentSDKAvailable(): Promise<boolean> {
  try {
    await import('@anthropic-ai/claude-agent-sdk')
    return true
  } catch {
    return false
  }
}

/**
 * Run a query via Claude Agent SDK if available,
 * otherwise fallback to `claude --print` CLI.
 */
export async function agentQuery(opts: AgentQueryOptions): Promise<string> {
  const sdkAvailable = await isAgentSDKAvailable()
  if (sdkAvailable) {
    opts.onLog?.('Agent backend: Claude Agent SDK')
    return agentSDKQuery(opts)
  }
  opts.onLog?.('Agent backend: claude CLI fallback (SDK unavailable)')
  return cliQuery(opts)
}

async function agentSDKQuery(opts: AgentQueryOptions): Promise<string> {
  const { query } = await import('@anthropic-ai/claude-agent-sdk')

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

    termLog('SDK mode started')

    let result = ''
    const messages = query({
      prompt: async function* () {
        yield opts.prompt
      },
      options: {
        cwd: opts.cwd ?? process.cwd(),
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

/**
 * Fallback: run `claude --print` CLI subprocess.
 */
function cliQuery(opts: AgentQueryOptions): Promise<string> {
  const args = ['--print', '--output-format', 'json']
  if (opts.systemPrompt) {
    args.push('--append-system-prompt', opts.systemPrompt)
  }

  return new Promise<string>((resolvePromise, reject) => {
    const proc = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      timeout: opts.timeoutMs ?? 120_000,
      cwd: opts.cwd,
    })

    proc.stdin.write(opts.prompt, 'utf-8')
    proc.stdin.end()

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => {
        proc.kill()
        reject(new Error('Aborted'))
      })
    }

    const prefix = opts.label ? `[${opts.label}]` : '[Agent]'

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stderr += text
      process.stderr.write(`${prefix} ${text}`)
      if (opts.onLog) {
        for (const line of text.split('\n')) {
          if (line.trim()) opts.onLog(line)
        }
      }
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`claude exited with code ${code}: ${stderr}`))
        return
      }
      try {
        const parsed = JSON.parse(stdout)
        resolvePromise(typeof parsed.result === 'string' ? parsed.result : stdout)
      } catch {
        resolvePromise(stdout)
      }
    })

    proc.on('error', reject)
  })
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
    const rendered = stringifyForLog(msg.result ?? msg.content)
    if (rendered) {
      logs.push(...toLogLines(`result: ${rendered}`))
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
