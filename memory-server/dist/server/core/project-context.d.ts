export declare class ProjectContext {
    readonly projectRoot: string;
    readonly seedDir: string;
    readonly cacheDir: string;
    readonly proposalsDir: string;
    constructor(projectPath: string);
    initialize(): Promise<void>;
    resolve(...segments: string[]): string;
    relative(absolutePath: string): string;
    get constitutionFiles(): string[];
    get rulesDir(): string;
    get knowledgeDirs(): string[];
}
