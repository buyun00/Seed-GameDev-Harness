export type KnowledgeCategory = 'rules' | 'project_knowledge' | 'public_interfaces' | 'code_standards' | 'architecture' | 'research' | 'runbooks' | 'uncategorized';
export type KnowledgeStatus = 'active' | 'stale' | 'reference_only';
export type LayerAffinity = 'affects_constitution' | 'candidate_for_memory' | 'reference_only';
export interface KnowledgeObject {
    id: string;
    title: string;
    category: KnowledgeCategory;
    summary: string;
    sourcePath: string;
    tags: string[];
    status: KnowledgeStatus;
    layerAffinity: LayerAffinity;
    updatedAt: string;
    content?: string;
}
