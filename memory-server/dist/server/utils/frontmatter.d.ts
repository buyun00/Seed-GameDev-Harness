export declare function parseFrontmatter(raw: string): {
    data: Record<string, unknown>;
    content: string;
};
export declare function stringifyFrontmatter(data: Record<string, unknown>, content: string): string;
