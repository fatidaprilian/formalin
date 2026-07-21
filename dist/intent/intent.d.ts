import { CritiqueMetrics, Finding, SceneNode } from '../types.js';
/**
 * Analyzes Scene Graphs across viewports to detect design consistency anomalies and compute health metrics.
 */
export declare function evaluateIntentAndConsistency(sceneGraphs: Map<number, SceneNode>, existingFindings: Finding[]): {
    metrics: CritiqueMetrics;
    findings: Finding[];
};
