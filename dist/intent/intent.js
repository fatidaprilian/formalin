"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateIntentAndConsistency = evaluateIntentAndConsistency;
/**
 * Analyzes Scene Graphs across viewports to detect design consistency anomalies and compute health metrics.
 */
function evaluateIntentAndConsistency(sceneGraphs, existingFindings) {
    const findings = [...existingFindings];
    const buttonRadiusMap = new Map();
    let h1FontSize = 0;
    let h2FontSize = 0;
    // Flatten nodes across the default desktop scene graph (1440px or largest available)
    const desktopGraph = sceneGraphs.get(1440) || Array.from(sceneGraphs.values())[0];
    if (desktopGraph) {
        traverseNodes(desktopGraph, node => {
            if (node.tagName === 'button') {
                const radius = node.computedStyle.borderRadius || '0px';
                buttonRadiusMap.set(radius, (buttonRadiusMap.get(radius) || 0) + 1);
            }
            if (node.tagName === 'h1' && node.typography) {
                h1FontSize = parseFloat(node.typography.fontSize) || 0;
            }
            if (node.tagName === 'h2' && node.typography) {
                h2FontSize = parseFloat(node.typography.fontSize) || 0;
            }
        });
    }
    // 1. Button Style Inconsistency Rule
    if (buttonRadiusMap.size > 3) {
        findings.push({
            code: 'CONSISTENCY_BUTTON_VARIANTS',
            severity: 'MEDIUM',
            category: 'Consistency',
            message: `Detected ${buttonRadiusMap.size} distinct button border-radius variants. Consider unifying button shapes to preserve design grammar.`,
            suggestedFix: 'Standardize button border-radius tokens in your design system.'
        });
    }
    // 2. Heading Hierarchy Collision Rule
    if (h1FontSize > 0 && h2FontSize > 0 && h2FontSize >= h1FontSize) {
        findings.push({
            code: 'HIERARCHY_HEADING_COLLISION',
            severity: 'HIGH',
            category: 'Hierarchy',
            message: `Heading 2 font size (${h2FontSize}px) is larger than or equal to Heading 1 font size (${h1FontSize}px).`,
            suggestedFix: 'Ensure H1 is visually dominant over H2 in the typography scale.'
        });
    }
    // Calculate Metrics
    let responsiveHealthScore = 100;
    let visualHierarchyScore = 100;
    let designConsistencyScore = 100;
    const spacingRhythmScore = 90;
    for (const f of findings) {
        if (f.category === 'Responsive') {
            responsiveHealthScore -= f.severity === 'HIGH' ? 15 : 10;
        }
        else if (f.category === 'Hierarchy') {
            visualHierarchyScore -= f.severity === 'HIGH' ? 20 : 10;
        }
        else if (f.category === 'Consistency') {
            designConsistencyScore -= f.severity === 'HIGH' ? 15 : 10;
        }
    }
    const metrics = {
        visualHierarchyScore: Math.max(0, visualHierarchyScore),
        spacingRhythmScore: Math.max(0, spacingRhythmScore),
        responsiveHealthScore: Math.max(0, responsiveHealthScore),
        designConsistencyScore: Math.max(0, designConsistencyScore)
    };
    return { metrics, findings };
}
function traverseNodes(node, visitor) {
    visitor(node);
    for (const child of node.children) {
        traverseNodes(child, visitor);
    }
}
