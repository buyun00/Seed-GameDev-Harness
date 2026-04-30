const DEFAULT_MODELS = {
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-20250514',
    gemini: 'gemini-2.5-flash',
    deepseek: 'deepseek-chat',
    qwen: 'qwen-plus',
    custom: 'gpt-4o',
};
const DEFAULT_BASE_URLS = {
    openai: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com/v1',
    qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    custom: 'http://localhost:11434/v1',
};
export class LlmProvider {
    configs = new Map();
    activeKey = '';
    setActiveConfig(key) {
        if (!this.configs.has(key))
            return false;
        this.activeKey = key;
        return true;
    }
    getActiveConfig() {
        if (!this.activeKey)
            return undefined;
        return this.configs.get(this.activeKey);
    }
    setConfig(key, config) {
        this.configs.set(key, config);
        if (!this.activeKey)
            this.activeKey = key;
    }
    removeConfig(key) {
        this.configs.delete(key);
        if (this.activeKey === key) {
            this.activeKey = this.configs.keys().next().value ?? '';
        }
    }
    getConfig(key) {
        return this.configs.get(key);
    }
    getAllConfigs() {
        return Array.from(this.configs.entries()).map(([key, config]) => ({
            key,
            config: { ...config, apiKey: maskApiKey(config.apiKey) },
        }));
    }
    getActiveKey() {
        return this.activeKey;
    }
    async chat(options) {
        const config = this.getActiveConfig();
        if (!config) {
            throw new Error('No active LLM configuration. Please set an API key first.');
        }
        switch (config.provider) {
            case 'openai':
                return this.chatOpenAI(config, options);
            case 'anthropic':
                return this.chatAnthropic(config, options);
            case 'gemini':
                return this.chatGemini(config, options);
            case 'deepseek':
            case 'qwen':
            case 'custom':
                return this.chatCustom(config, options);
            default:
                throw new Error(`Unsupported provider: ${config.provider}`);
        }
    }
    async chatOpenAI(config, options) {
        const baseUrl = config.baseUrl || DEFAULT_BASE_URLS.openai;
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || DEFAULT_MODELS.openai,
                messages: options.messages,
                max_tokens: config.maxTokens ?? 4096,
                temperature: config.temperature ?? 0.7,
                stream: !!options.onChunk,
            }),
            signal: options.signal,
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API error (${response.status}): ${err}`);
        }
        if (options.onChunk && response.body) {
            return this.handleSSEStream(response.body, options.onChunk, options.signal);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
    }
    async chatAnthropic(config, options) {
        const systemMsg = options.messages.find(m => m.role === 'system');
        const nonSystemMessages = options.messages.filter(m => m.role !== 'system');
        const body = {
            model: config.model || DEFAULT_MODELS.anthropic,
            max_tokens: config.maxTokens ?? 4096,
            messages: nonSystemMessages.map(m => ({
                role: m.role,
                content: m.content,
            })),
        };
        if (systemMsg) {
            body.system = systemMsg.content;
        }
        if (options.onChunk) {
            body.stream = true;
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic API error (${response.status}): ${err}`);
        }
        if (options.onChunk && response.body) {
            return this.handleAnthropicSSE(response.body, options.onChunk, options.signal);
        }
        const data = await response.json();
        return data.content?.[0]?.text ?? '';
    }
    async chatGemini(config, options) {
        const baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
        const model = config.model || DEFAULT_MODELS.gemini;
        const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${config.apiKey}`;
        const contents = options.messages
            .filter(m => m.role !== 'system')
            .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const body = {
            contents,
            generationConfig: {
                maxOutputTokens: config.maxTokens ?? 4096,
                temperature: config.temperature ?? 0.7,
            },
        };
        const systemMsg = options.messages.find(m => m.role === 'system');
        if (systemMsg) {
            body.systemInstruction = { parts: [{ text: systemMsg.content }] };
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: options.signal,
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${err}`);
        }
        const data = await response.json();
        let result = '';
        const candidates = data.candidates ?? [];
        for (const candidate of candidates) {
            const parts = candidate.content?.parts ?? [];
            for (const part of parts) {
                if (part.text) {
                    result += part.text;
                    options.onChunk?.(part.text);
                }
            }
        }
        return result;
    }
    async chatCustom(config, options) {
        const baseUrl = config.baseUrl || DEFAULT_BASE_URLS[config.provider] || 'http://localhost:11434/v1';
        const defaultModel = DEFAULT_MODELS[config.provider] || DEFAULT_MODELS.custom;
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model || defaultModel,
                messages: options.messages,
                max_tokens: config.maxTokens ?? 4096,
                temperature: config.temperature ?? 0.7,
                stream: !!options.onChunk,
            }),
            signal: options.signal,
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`${config.provider} API error (${response.status}): ${err}`);
        }
        if (options.onChunk && response.body) {
            return this.handleSSEStream(response.body, options.onChunk, options.signal);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content ?? '';
    }
    async handleSSEStream(body, onChunk, signal) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        try {
            while (true) {
                if (signal?.aborted)
                    break;
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: '))
                        continue;
                    const data = trimmed.slice(6);
                    if (data === '[DONE]')
                        continue;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.text ?? '';
                        if (content) {
                            fullText += content;
                            onChunk(content);
                        }
                    }
                    catch { }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        return fullText;
    }
    async handleAnthropicSSE(body, onChunk, signal) {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        try {
            while (true) {
                if (signal?.aborted)
                    break;
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data: '))
                        continue;
                    const data = trimmed.slice(6);
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                            fullText += parsed.delta.text;
                            onChunk(parsed.delta.text);
                        }
                    }
                    catch { }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        return fullText;
    }
}
function maskApiKey(key) {
    if (key.length <= 8)
        return '****';
    return key.slice(0, 4) + '****' + key.slice(-4);
}
export const llmProvider = new LlmProvider();
