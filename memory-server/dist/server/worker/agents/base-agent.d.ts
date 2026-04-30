export interface AgentQueryOptions {
    prompt: string;
    systemPrompt?: string;
    cwd?: string;
    timeoutMs?: number;
    signal?: AbortSignal;
    disallowedTools?: string[];
    label?: string;
    onLog?: (msg: string) => void;
}
export interface AgentBackendInfo {
    available: boolean;
    label: string;
    error?: string;
}
export declare function detectAgentBackend(): Promise<AgentBackendInfo>;
export declare function isAgentSDKAvailable(): Promise<boolean>;
export declare function getAgentBackendLabel(): Promise<string>;
export declare function agentQuery(opts: AgentQueryOptions): Promise<string>;
