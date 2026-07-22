import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ShadowSnapshot } from '../types.js';

export function getShadowDir(rootDir: string = process.cwd()): string {
  return path.join(rootDir, '.formalin', 'shadow');
}

export function computePathHash(relativeFilePath: string): string {
  return crypto.createHash('md5').update(relativeFilePath).digest('hex');
}

export function saveSnapshot(targetPath: string, rootDir: string = process.cwd()): ShadowSnapshot | null {
  const absPath = path.resolve(rootDir, targetPath);
  if (!fs.existsSync(absPath)) {
    return null;
  }

  const relPath = path.relative(rootDir, absPath);
  const content = fs.readFileSync(absPath, 'utf-8');
  const hash = computePathHash(relPath);

  const snapshot: ShadowSnapshot = {
    filePath: relPath,
    hash,
    capturedAt: new Date().toISOString(),
    content
  };

  const shadowDir = getShadowDir(rootDir);
  if (!fs.existsSync(shadowDir)) {
    fs.mkdirSync(shadowDir, { recursive: true });
  }

  const snapshotPath = path.join(shadowDir, `${hash}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');

  return snapshot;
}

export function loadSnapshots(rootDir: string = process.cwd()): ShadowSnapshot[] {
  const shadowDir = getShadowDir(rootDir);
  if (!fs.existsSync(shadowDir)) {
    return [];
  }

  const files = fs.readdirSync(shadowDir).filter(f => f.endsWith('.json'));
  const snapshots: ShadowSnapshot[] = [];

  for (const file of files) {
    try {
      const fullPath = path.join(shadowDir, file);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      snapshots.push(JSON.parse(raw));
    } catch {
      // Ignore read errors
    }
  }

  return snapshots;
}
