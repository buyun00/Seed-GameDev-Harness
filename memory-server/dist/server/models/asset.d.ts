export type AssetKind = 'constitution' | 'memory' | 'knowledge';
export interface Asset {
    id: string;
    title: string;
    kind: AssetKind;
    sourcePath: string;
    summary: string;
    status: string;
    updatedAt: string;
    tags: string[];
    fileHash: string;
}
