export declare class Writer {
    private mutex;
    static cleanupStaleFiles(dir: string, maxAgeMs?: number): Promise<void>;
    private static cleanupDirectory;
    write(filePath: string, content: string): Promise<void>;
    read(filePath: string): Promise<string>;
    private doWrite;
}
