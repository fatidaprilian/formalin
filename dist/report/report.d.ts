import { CritiqueReport } from '../types.js';
/**
 * Writes formatted JSON and Markdown audit reports to the output directory.
 */
export declare function writeReports(report: CritiqueReport, outputDir: string): {
    jsonPath: string;
    mdPath: string;
};
