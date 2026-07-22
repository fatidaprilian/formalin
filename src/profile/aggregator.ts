import fs from 'fs';
import path from 'path';
import { DeltaSignal, PreferenceProfile, ScoredDimensions } from '../types.js';

export function getProfilePath(rootDir: string = process.cwd()): string {
  return path.join(rootDir, '.formalin', 'profile.json');
}

export function getInitialProfile(): PreferenceProfile {
  const dimensions: ScoredDimensions = {
    color_temperature: { value: -0.10, confidence: 0.20 },
    saturation_restraint: { value: 0.20, confidence: 0.20 },
    spacing_density: { value: 0.30, confidence: 0.20 },
    radius_preference: { value: -0.10, confidence: 0.20 },
    depth_style: { value: -0.20, confidence: 0.20 },
    typography_character: { value: 0.10, confidence: 0.20 }
  };

  return {
    dimensions,
    sampleCount: 0,
    lastUpdated: new Date().toISOString()
  };
}

export function loadProfile(rootDir: string = process.cwd()): PreferenceProfile {
  const profilePath = getProfilePath(rootDir);
  if (!fs.existsSync(profilePath)) {
    return getInitialProfile();
  }

  try {
    const raw = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return getInitialProfile();
  }
}

export function saveProfile(profile: PreferenceProfile, rootDir: string = process.cwd()): void {
  const profilePath = getProfilePath(rootDir);
  const dir = path.dirname(profilePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
}

export function updateProfile(
  deltas: DeltaSignal[],
  rootDir: string = process.cwd()
): PreferenceProfile {
  const profile = loadProfile(rootDir);

  if (deltas.length === 0) {
    return profile;
  }

  for (const signal of deltas) {
    const current = profile.dimensions[signal.dimension];
    if (current) {
      // Exponential moving average update
      const updatedValue = current.value + signal.delta * 0.25;
      current.value = parseFloat(clamp(updatedValue, -1.0, 1.0).toFixed(2));
      current.confidence = parseFloat(Math.min(1.0, current.confidence + 0.08).toFixed(2));
    }
  }

  profile.sampleCount += 1;
  profile.lastUpdated = new Date().toISOString();

  saveProfile(profile, rootDir);
  return profile;
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
