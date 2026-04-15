import { spawn } from 'node:child_process'

export interface ClaudeInvocation {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  timeout?: number
}

export interface ClaudeStreamEvent {
  type: 'text_delta' | 'result' | 'error'
  content?: string
  result?: ClaudeResult
}

export interface ClaudeResult {
  result: string
  total_cost_usd?: number
  duration_ms?: number
  session_id?: string
}

export class ClaudeAdapter {
  async invoke(inv: ClaudeInvocation): Promise<string> {
    const args = ['--print', '--output-format', 'json']
    if (inv.systemPrompt) {
      args.push('--append-system-prompt', inv.systemPrompt)
    }
    args.push(inv.prompt)

    return new Promise<string>((resolve, reject) => {
      const proc = spawn('claude', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        timeout: inv.timeout ?? 120_000,
      })

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
          resolve(typeof parsed.result === 'string' ? parsed.result : stdout)
        } catch {
          resolve(stdout)
        }
      })

      proc.on('error', reject)
    })
  }

  async *invokeStream(inv: ClaudeInvocation): AsyncIterable<ClaudeStreamEvent> {
    const args = ['--print', '--output-format', 'stream-json']
    if (inv.systemPrompt) {
      args.push('--append-system-prompt', inv.systemPrompt)
    }
    args.push(inv.prompt)

    const proc = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      timeout: inv.timeout ?? 120_000,
    })

    let buffer = ''
    const events: ClaudeStreamEvent[] = []
    let done = false
    let error: Error | null = null

    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            events.push({ type: 'text_delta', content: parsed.delta.text })
          } else if (parsed.type === 'result') {
            events.push({ type: 'result', result: parsed as unknown as ClaudeResult })
          }
        } catch {
          // skip unparseable lines
        }
      }
    })

    proc.on('error', (err) => { error = err })
    proc.on('close', () => { done = true })

    while (!done || events.length > 0) {
      if (events.length > 0) {
        yield events.shift()!
      } else {
        await new Promise(r => setTimeout(r, 50))
      }
      if (error) throw error
    }
  }
}
