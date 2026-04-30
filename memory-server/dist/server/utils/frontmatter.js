import matter from 'gray-matter';
export function parseFrontmatter(raw) {
    const { data, content } = matter(raw);
    return { data, content };
}
export function stringifyFrontmatter(data, content) {
    return matter.stringify(content, data);
}
