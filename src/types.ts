export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
}

export interface TypographyInfo {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  fontFamily: string;
}

export interface SceneNode {
  id: string;
  tagName: string;
  selector: string;
  sourceLocation?: SourceLocation;
  boundingBox: BoundingBox;
  visualWeight: number;
  typography?: TypographyInfo;
  computedStyle: Record<string, string>;
  children: SceneNode[];
}

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type FindingCategory = 'Responsive' | 'Hierarchy' | 'Consistency' | 'Intent';

export interface Finding {
  code: string;
  severity: FindingSeverity;
  category: FindingCategory;
  message: string;
  selector?: string;
  sourceLocation?: SourceLocation;
  viewport?: string;
  suggestedFix?: string;
}

export interface CritiqueMetrics {
  visualHierarchyScore: number;
  spacingRhythmScore: number;
  responsiveHealthScore: number;
  designConsistencyScore: number;
}

export interface CritiqueReport {
  schemaVersion: string;
  targetUrl: string;
  timestamp: string;
  metrics: CritiqueMetrics;
  findings: Finding[];
}

export interface InspectOptions {
  outputDir: string;
  remoteDebuggingPort?: number;
  viewports: number[];
  brief?: string;
  verbose?: boolean;
}
