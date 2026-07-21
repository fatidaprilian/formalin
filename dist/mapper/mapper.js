"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSourceLocations = resolveSourceLocations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves source file locations for findings by searching the workspace repository.
 */
function resolveSourceLocations(findings, repoDir) {
    return findings.map(finding => {
        if (finding.sourceLocation) {
            return finding;
        }
        if (finding.selector) {
            const guessedLocation = guessSourceLocationFromSelector(finding.selector, repoDir);
            if (guessedLocation) {
                return {
                    ...finding,
                    sourceLocation: guessedLocation
                };
            }
        }
        return finding;
    });
}
function guessSourceLocationFromSelector(selector, repoDir) {
    const cleanSelector = selector.toLowerCase();
    const classMatches = cleanSelector.match(/[\.#]([a-z0-9_-]+)/g);
    if (!classMatches) {
        return undefined;
    }
    const candidates = [];
    function searchFiles(dir) {
        if (!fs_1.default.existsSync(dir)) {
            return;
        }
        try {
            const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.formalin') {
                    searchFiles(path_1.default.join(dir, entry.name));
                }
                else if (entry.isFile() && /\.(tsx|jsx|vue|html|css)$/i.test(entry.name)) {
                    candidates.push(path_1.default.join(dir, entry.name));
                }
            }
        }
        catch {
            // Ignore read errors
        }
    }
    searchFiles(repoDir);
    for (const candidate of candidates) {
        const filename = path_1.default.basename(candidate).toLowerCase();
        for (const match of classMatches) {
            const className = match.substring(1);
            if (filename.includes(className)) {
                return {
                    file: path_1.default.relative(repoDir, candidate),
                    line: 1
                };
            }
        }
    }
    return undefined;
}
