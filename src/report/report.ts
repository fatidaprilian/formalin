import fs from 'fs';
import path from 'path';
import { CritiqueReport } from '../types.js';

/**
 * Writes formatted JSON and Markdown audit reports to the output directory.
 */
export function writeReports(report: CritiqueReport, outputDir: string): { jsonPath: string; mdPath: string } {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonPath = path.join(outputDir, 'critique.json');
  const mdPath = path.join(outputDir, 'formalin-summary.md');

  // 1. Write critique.json
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

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
  } else {
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

  fs.writeFileSync(mdPath, md, 'utf-8');

  return { jsonPath, mdPath };
}
