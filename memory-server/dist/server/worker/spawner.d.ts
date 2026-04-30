export interface SpawnResult {
    port: number;
    pid: number;
    alreadyRunning: boolean;
}
/**
 * Ensure a worker is running for the given project path.
 * If already alive, returns the existing port. Otherwise spawns a new
 * hidden background daemon process and polls health until ready.
 */
export declare function ensureWorkerStarted(rawProjectPath: string, opts?: {
    port?: number;
    timeoutMs?: number;
}): Promise<SpawnResult>;
