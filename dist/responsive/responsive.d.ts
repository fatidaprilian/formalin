import { Browser } from 'puppeteer-core';
import { Finding, SceneNode } from '../types.js';
/**
 * Runs viewport inspections across multiple resolution breakpoints to detect layout anomalies.
 */
export declare function inspectViewports(browser: Browser, targetUrl: string, viewportWidths: number[]): Promise<{
    findings: Finding[];
    sceneGraphs: Map<number, SceneNode>;
}>;
