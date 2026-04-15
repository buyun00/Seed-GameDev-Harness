import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export function hashString(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf-8')
  return hashString(content)
}

export function stableId(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16)
}
