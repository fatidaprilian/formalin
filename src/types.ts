export type DimensionKey =
  | 'color_temperature'
  | 'saturation_restraint'
  | 'spacing_density'
  | 'radius_preference'
  | 'depth_style'
  | 'typography_character';

export interface DimensionScore {
  value: number; // Range -1.0 to +1.0
  confidence: number; // Range 0.0 to 1.0
}

export type ScoredDimensions = Record<DimensionKey, DimensionScore>;

export interface PreferenceProfile {
  dimensions: ScoredDimensions;
  sampleCount: number;
  lastUpdated: string;
}

export interface ShadowSnapshot {
  filePath: string;
  hash: string;
  capturedAt: string;
  content: string;
}

export interface DeltaSignal {
  dimension: DimensionKey;
  delta: number;
  reason: string;
}

export interface BriefOptions {
  outputDir?: string;
  verbose?: boolean;
}
