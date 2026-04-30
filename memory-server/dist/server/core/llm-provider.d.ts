export type ModelProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'qwen' | 'custom';
export interface LlmConfig {
    provider: ModelProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface ChatCompletionOptions {
    messages: ChatMessage[];
    signal?: AbortSignal;
    onChunk?: (text: string) => void;
}
export declare class LlmProvider {
    private configs;
    private activeKey;
    setActiveConfig(key: string): boolean;
    getActiveConfig(): LlmConfig | undefined;
    setConfig(key: string, config: LlmConfig): void;
    removeConfig(key: string): void;
    getConfig(key: string): LlmConfig | undefined;
    getAllConfigs(): Array<{
        key: string;
        config: LlmConfig;
    }>;
    getActiveKey(): string;
    chat(options: ChatCompletionOptions): Promise<string>;
    private chatOpenAI;
    private chatAnthropic;
    private chatGemini;
    private chatCustom;
    private handleSSEStream;
    private handleAnthropicSSE;
}
export declare const llmProvider: LlmProvider;
