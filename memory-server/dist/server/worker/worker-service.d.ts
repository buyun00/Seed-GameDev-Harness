export declare class WorkerService {
    private server;
    private watcher;
    private sessionStore;
    private taskQueue;
    private canonicalPath;
    private shuttingDown;
    start(rawProjectPath: string, port?: number): Promise<{
        port: number;
    }>;
    shutdown(): Promise<void>;
    private writeUrlFile;
    private registerSignalHandlers;
}
