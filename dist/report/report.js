"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReports = writeReports;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Writes formatted JSON and Markdown audit reports to the output directory.
 */
function writeReports(report, outputDir) {
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const jsonPath = path_1.default.join(outputDir, 'critique.json');
    const mdPath = path_1.default.join(outputDir, 'formalin-summary.md');
    // 1. Write critique.json
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    // 2. Write formalin-summary.md
    let md = '# Formalin Visual Perception Audit Report\n\n';
    md += `Target URL: ${report.targetUrl}\n`;
    md += `Timestamp: ${report.timestamp}\n\n`;
    md += '## Health Metrics\n';
    md += `- Visual Hierarchy Score: ${report.metrics.visualHierarchyScore}/100\n`;
    md += `- Spacing Rhythm Score: ${report.metrics.spacingRhythmScore}/100\n`;
    md += `- Responsive Health Score: ${report.metrics.responsiveHealthScore}/100\n`;
    md += `- Design Consistency Score: ${report.metrics.designConsistencyScore}/100\n\n`;
    md += '## Findings\n\n';
    if (report.findings.length === 0) {
        md += 'No visual design issues or responsive anomalies were detected.\n\n';
    }
    else {
        for (const f of report.findings) {
            md += `### [${f.severity}] ${f.code}: ${f.category}\n`;
            md += `${f.message}\n`;
            if (f.selector) {
                md += `- Selector: \`${f.selector}\`\n`;
            }
            if (f.sourceLocation) {
                md += `- Source Location: \`${f.sourceLocation.file}:${f.sourceLocation.line}\`\n`;
            }
            if (f.suggestedFix) {
                md += `- Suggested Fix: ${f.suggestedFix}\n`;
            }
            md += '\n';
        }
    }
    fs_1.default.writeFileSync(mdPath, md, 'utf-8');
    return { jsonPath, mdPath };
}
