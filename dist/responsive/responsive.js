"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectViewports = inspectViewports;
const client_js_1 = require("../cdp/client.js");
const scenegraph_js_1 = require("../scene/scenegraph.js");
/**
 * Runs viewport inspections across multiple resolution breakpoints to detect layout anomalies.
 */
async function inspectViewports(browser, targetUrl, viewportWidths) {
    const findings = [];
    const sceneGraphs = new Map();
    for (const width of viewportWidths) {
        const viewport = {
            width,
            height: width < 768 ? 812 : 900,
            isMobile: width < 768
        };
        const page = await (0, client_js_1.createSessionPage)(browser, viewport, targetUrl);
        const sceneGraph = await (0, scenegraph_js_1.buildSceneGraph)(page);
        sceneGraphs.set(width, sceneGraph);
        // Evaluate responsive rules
        evaluateNodeResponsiveRules(sceneGraph, viewport, findings);
        await page.close();
    }
    return { findings, sceneGraphs };
}
function evaluateNodeResponsiveRules(node, viewport, findings) {
    // 1. Horizontal Content Overflow (RESP_OVERFLOW)
    const rightEdge = node.boundingBox.x + node.boundingBox.width;
    if (rightEdge > viewport.width + 4 && node.tagName !== 'body' && node.tagName !== 'html') {
        findings.push({
            code: 'RESP_OVERFLOW',
            severity: 'HIGH',
            category: 'Responsive',
            message: `Element '${node.selector}' extends beyond the horizontal viewport boundary at ${viewport.width}px. (Right edge: ${rightEdge}px)`,
            selector: node.selector,
            sourceLocation: node.sourceLocation,
            viewport: `${viewport.width}x${viewport.height}`,
            suggestedFix: 'Apply max-width: 100% or overflow-wrap: break-word.'
        });
    }
    // 2. Primary Action Pushed Below Fold on Mobile (RESP_PUSHED_CTA)
    if (viewport.isMobile && node.tagName === 'button' && node.boundingBox.y > viewport.height) {
        findings.push({
            code: 'RESP_PUSHED_CTA',
            severity: 'HIGH',
            category: 'Responsive',
            message: `Primary action button '${node.selector}' is pushed below the initial viewport fold on mobile screen width (${viewport.width}px).`,
            selector: node.selector,
            sourceLocation: node.sourceLocation,
            viewport: `${viewport.width}x${viewport.height}`,
            suggestedFix: 'Reorder hero content or reduce vertical spacing to keep primary action visible above the fold.'
        });
    }
    // Recurse into children
    for (const child of node.children) {
        evaluateNodeResponsiveRules(child, viewport, findings);
    }
}
