import { Finding } from '../types.js';
/**
 * Resolves source file locations for findings by searching the workspace repository.
 */
export declare function resolveSourceLocations(findings: Finding[], repoDir: string): Finding[];
