import matter from 'gray-matter';
export function parseMarkdown(raw) {
    const { data, content } = matter(raw);
    const lines = content.trim().split('\n');
    const excerpt = lines.slice(0, 3).join(' ').slice(0, 200);
    return { frontmatter: data, content, excerpt };
}
export function extractTitle(raw, fallbackPath) {
    const { data, content } = matter(raw);
    if (data.title)
        return data.title;
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch)
        return headingMatch[1].trim();
    const basename = fallbackPath.split(/[/\\]/).pop() ?? fallbackPath;
    return basename.replace(/\.md$/i, '');
}
const IMPORT_RE = /(?:^|\s)@([\w./_~-]+(?:\.[\w]+)?)/gm;
export function extractImports(content) {
    const results = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let match;
        IMPORT_RE.lastIndex = 0;
        while ((match = IMPORT_RE.exec(lines[i])) !== null) {
            results.push({ directive: match[1], line: i + 1 });
        }
    }
    return results;
}
