import { Browser, Page } from 'puppeteer-core';
import { Viewport } from '../types.js';
/**
 * Searches system PATH and standard binary paths for Google Chrome, Chromium, or Microsoft Edge.
 */
export declare function findChromeExecutable(): string;
/**
 * Launches a headless browser instance via CDP or connects to a remote debugging port.
 */
export declare function launchOrConnect(remoteDebuggingPort?: number): Promise<Browser>;
/**
 * Creates a new browser page configured with a specific viewport and navigates to the target URL.
 */
export declare function createSessionPage(browser: Browser, viewport: Viewport, targetUrl: string): Promise<Page>;
