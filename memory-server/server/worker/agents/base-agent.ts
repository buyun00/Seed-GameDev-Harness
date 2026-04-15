import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

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
 * Returns false if the module cannot be imported (P2 external dependency).
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
    return agentSDKQuery(opts)
  }
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

    termLog('SDK 模式启动...')

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = message as any

      if (msg.type === 'assistant') {
        if (typeof msg.content === 'string') {
          if (msg.content.trim()) {
            forwardLog(msg.content.slice(0, 400))
          }
          result += msg.content
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'text') {
              if (block.text.trim()) {
                forwardLog(block.text.slice(0, 400))
              }
              result += block.text
            } else if (block.type === 'tool_use') {
              const summary = `调用工具: ${block.name}(${JSON.stringify(block.input ?? {}).slice(0, 120)})`
              forwardLog(summary)
            }
          }
        }
      } else if (msg.type === 'tool_result') {
        const preview = typeof msg.content === 'string'
          ? msg.content.slice(0, 120)
          : JSON.stringify(msg.content ?? '').slice(0, 120)
        forwardLog(`工具结果: ${preview}`)
      } else if (msg.type && msg.type !== 'user') {
        termLog(`[${msg.type}]`)
      }
    }

    termLog('SDK 查询完成')
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
  // Note: prompt is NOT passed as a CLI arg — it is written to stdin below.
  // Claude CLI reads from stdin when a pipe is open, and ignores positional args in that case.

  return new Promise<string>((resolvePromise, reject) => {
    const proc = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      timeout: opts.timeoutMs ?? 120_000,
      cwd: opts.cwd,
    })

    // Write prompt to stdin and close it so Claude CLI doesn't wait for more input
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

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stderr += text
      // 实时打印到终端
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
