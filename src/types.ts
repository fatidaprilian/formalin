export interface ClassTransformationResult {
  originalClass: string;
  sanitizedClass: string;
  transformations: string[];
}

export interface SanitizerConfig {
  stripShadows: boolean;
  normalizeRadius: boolean;
  normalizeSpacing: boolean;
  neutralizeGradients: boolean;
}
