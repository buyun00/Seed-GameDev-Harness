import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

export interface AgentQueryOptions {
  prompt: string
  systemPrompt?: string
  cwd?: string
  timeoutMs?: number
  signal?: AbortSignal
  disallowedTools?: string[]
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

  try {
    const disallowedTools = opts.disallowedTools ?? [
      'Write', 'Edit', 'MultiEdit', 'Shell',
      'WebFetch', 'WebSearch', 'TodoWrite',
    ]

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
      if (message.type === 'assistant' && typeof message.content === 'string') {
        result += message.content
      } else if (message.type === 'assistant' && Array.isArray(message.content)) {
        for (const block of message.content) {
          if (block.type === 'text') {
            result += block.text
          }
        }
      }
    }

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
  args.push(opts.prompt)

  return new Promise<string>((resolvePromise, reject) => {
    const proc = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      timeout: opts.timeoutMs ?? 120_000,
      cwd: opts.cwd,
    })

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => {
        proc.kill()
        reject(new Error('Aborted'))
      })
    }

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

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
