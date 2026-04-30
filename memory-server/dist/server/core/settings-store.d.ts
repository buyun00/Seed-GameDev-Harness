import type { LlmConfig } from '../core/llm-provider.js';
export interface SettingsData {
    language: string;
    theme: string;
    apiConfigs: Array<{
        key: string;
        config: LlmConfig;
    }>;
    activeApiKey: string;
    chatHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
}
export declare class SettingsStore {
    private data;
    private filePath;
    constructor(projectRoot: string);
    private load;
    private save;
    get<K extends keyof SettingsData>(key: K): SettingsData[K];
    set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void;
    getAll(): SettingsData;
    updateChatHistory(history: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>): void;
}
