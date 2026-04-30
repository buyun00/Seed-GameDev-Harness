import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const DEFAULT_SETTINGS = {
    language: 'zh',
    theme: 'dark',
    apiConfigs: [],
    activeApiKey: '',
    chatHistory: [],
};
export class SettingsStore {
    data;
    filePath;
    constructor(projectRoot) {
        const seedDir = join(projectRoot, '.seed');
        if (!existsSync(seedDir)) {
            mkdirSync(seedDir, { recursive: true });
        }
        this.filePath = join(seedDir, 'settings.json');
        this.data = this.load();
    }
    load() {
        try {
            if (existsSync(this.filePath)) {
                const raw = readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        }
        catch {
            process.stderr.write('[Settings] Failed to load settings, using defaults\n');
        }
        return { ...DEFAULT_SETTINGS };
    }
    save() {
        try {
            writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch {
            process.stderr.write('[Settings] Failed to save settings\n');
        }
    }
    get(key) {
        return this.data[key];
    }
    set(key, value) {
        this.data[key] = value;
        this.save();
    }
    getAll() {
        return { ...this.data };
    }
    updateChatHistory(history) {
        this.data.chatHistory = history.slice(-200);
        this.save();
    }
}
