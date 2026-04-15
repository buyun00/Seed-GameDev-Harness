import matter from 'gray-matter'

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>
  content: string
  excerpt: string
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw)
  const lines = content.trim().split('\n')
  const excerpt = lines.slice(0, 3).join(' ').slice(0, 200)
  return { frontmatter: data, content, excerpt }
}

export function extractTitle(raw: string, fallbackPath: string): string {
  const { data, content } = matter(raw)
  if (data.title) return data.title as string

  const headingMatch = content.match(/^#\s+(.+)$/m)
  if (headingMatch) return headingMatch[1].trim()

  const basename = fallbackPath.split(/[/\\]/).pop() ?? fallbackPath
  return basename.replace(/\.md$/i, '')
}

const IMPORT_RE = /(?:^|\s)@([\w./_~-]+(?:\.[\w]+)?)/gm

export function extractImports(content: string): Array<{ directive: string; line: number }> {
  const results: Array<{ directive: string; line: number }> = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let match: RegExpExecArray | null
    IMPORT_RE.lastIndex = 0
    while ((match = IMPORT_RE.exec(lines[i])) !== null) {
      results.push({ directive: match[1], line: i + 1 })
    }
  }
  return results
}
