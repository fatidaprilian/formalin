import fs from 'fs';
import path from 'path';
import { Finding, SourceLocation } from '../types.js';

/**
 * Resolves source file locations for findings by searching the workspace repository.
 */
export function resolveSourceLocations(findings: Finding[], repoDir: string): Finding[] {
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

function guessSourceLocationFromSelector(selector: string, repoDir: string): SourceLocation | undefined {
  const cleanSelector = selector.toLowerCase();
  const classMatches = cleanSelector.match(/[\.#]([a-z0-9_-]+)/g);

  if (!classMatches) {
    return undefined;
  }

  const candidates: string[] = [];
  function searchFiles(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.formalin') {
          searchFiles(path.join(dir, entry.name));
        } else if (entry.isFile() && /\.(tsx|jsx|vue|html|css)$/i.test(entry.name)) {
          candidates.push(path.join(dir, entry.name));
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  searchFiles(repoDir);

  for (const candidate of candidates) {
    const filename = path.basename(candidate).toLowerCase();
    for (const match of classMatches) {
      const className = match.substring(1);
      if (filename.includes(className)) {
        return {
          file: path.relative(repoDir, candidate),
          line: 1
        };
      }
    }
  }

  return undefined;
}
