export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  oldLineNo?: number
  newLineNo?: number
}

export function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n')
  const result: DiffLine[] = []
  let oldLine = 0
  let newLine = 0

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)/)
      if (match) {
        oldLine = parseInt(match[1]) - 1
        newLine = oldLine
      }
      continue
    }
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('Index:') || line.startsWith('===')) {
      continue
    }

    if (line.startsWith('+')) {
      newLine++
      result.push({ type: 'add', content: line.slice(1), newLineNo: newLine })
    } else if (line.startsWith('-')) {
      oldLine++
      result.push({ type: 'remove', content: line.slice(1), oldLineNo: oldLine })
    } else if (line.startsWith(' ') || line === '') {
      oldLine++
      newLine++
      result.push({ type: 'context', content: line.startsWith(' ') ? line.slice(1) : line, oldLineNo: oldLine, newLineNo: newLine })
    }
  }

  return result
}
