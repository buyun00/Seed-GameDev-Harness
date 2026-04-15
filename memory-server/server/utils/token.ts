import { randomUUID } from 'node:crypto'

export function generateToken(): string {
  return randomUUID()
}
