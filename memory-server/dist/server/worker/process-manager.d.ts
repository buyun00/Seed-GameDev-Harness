export interface PidInfo {
    pid: number;
    port: number;
    projectPath: string;
    startedAt: string;
}
/**
 * Normalize a project path to a canonical form so that the same working tree
 * always produces the same slug regardless of casing, symlinks, or sub-directory entry.
 *
 * Rules (in order):
 *   1. path.resolve → absolute
 *   2. fs.realpathSync → resolve symlinks
 *   3. git: --show-toplevel to lift sub-dirs to the working-tree root
 *      (works for both normal repos and worktrees — returns the worktree root,
 *       NOT the main repo root, so different worktrees stay isolated)
 *   4. Windows: upper-case drive letter, lower-case remainder
 *   5. Normalise separators to '/'
 */
export declare function canonicalizeProjectPath(rawPath: string): string;
export declare function getProjectSlug(canonicalPath: string): string;
export declare function getWorkerPidPath(canonicalPath: string): string;
export declare function writePidFile(canonicalPath: string, info: PidInfo): void;
export declare function readPidFile(canonicalPath: string): PidInfo | null;
export declare function removePidFile(canonicalPath: string): void;
export declare function acquirePidFile(canonicalPath: string, info: PidInfo): boolean;
export declare function updatePidFile(canonicalPath: string, info: PidInfo): void;
export declare function isProcessAlive(pid: number): boolean;
export declare function validatePidFile(canonicalPath: string): 'alive' | 'stale' | 'missing';
export declare function listAllWorkers(): Array<PidInfo & {
    status: 'alive' | 'stale';
}>;
