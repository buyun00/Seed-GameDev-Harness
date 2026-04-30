export interface ParsedMarkdown {
    frontmatter: Record<string, unknown>;
    content: string;
    excerpt: string;
}
export declare function parseMarkdown(raw: string): ParsedMarkdown;
export declare function extractTitle(raw: string, fallbackPath: string): string;
export declare function extractImports(content: string): Array<{
    directive: string;
    line: number;
}>;
