import puppeteer, { Browser, Page } from 'puppeteer-core';
import { execSync } from 'child_process';
import fs from 'fs';
import { Viewport } from '../types.js';

/**
 * Searches system PATH and standard binary paths for Google Chrome, Chromium, or Microsoft Edge.
 */
export function findChromeExecutable(): string {
  const candidates = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge-stable',
    '/usr/bin/microsoft-edge'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  try {
    const found = execSync('which google-chrome || which chromium || which chromium-browser || which microsoft-edge', { encoding: 'utf-8' }).trim();
    if (found && fs.existsSync(found)) {
      return found;
    }
  } catch {
    // Search failed
  }

  throw new Error('Chrome/Chromium or Edge executable not found. Please install Chrome or Chromium on your system.');
}

/**
 * Launches a headless browser instance via CDP or connects to a remote debugging port.
 */
export async function launchOrConnect(remoteDebuggingPort?: number): Promise<Browser> {
  if (remoteDebuggingPort) {
    const browserWSEndpoint = `ws://127.0.0.1:${remoteDebuggingPort}/devtools/browser`;
    return await puppeteer.connect({ browserWSEndpoint });
  }

  const executablePath = findChromeExecutable();
  return await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
}

/**
 * Creates a new browser page configured with a specific viewport and navigates to the target URL.
 */
export async function createSessionPage(browser: Browser, viewport: Viewport, targetUrl: string): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor || 1,
    isMobile: viewport.isMobile || viewport.width < 768
  });

  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  return page;
}
