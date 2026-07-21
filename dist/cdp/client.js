"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findChromeExecutable = findChromeExecutable;
exports.launchOrConnect = launchOrConnect;
exports.createSessionPage = createSessionPage;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
/**
 * Searches system PATH and standard binary paths for Google Chrome, Chromium, or Microsoft Edge.
 */
function findChromeExecutable() {
    const candidates = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/microsoft-edge-stable',
        '/usr/bin/microsoft-edge'
    ];
    for (const candidate of candidates) {
        if (fs_1.default.existsSync(candidate)) {
            return candidate;
        }
    }
    try {
        const found = (0, child_process_1.execSync)('which google-chrome || which chromium || which chromium-browser || which microsoft-edge', { encoding: 'utf-8' }).trim();
        if (found && fs_1.default.existsSync(found)) {
            return found;
        }
    }
    catch {
        // Search failed
    }
    throw new Error('Chrome/Chromium or Edge executable not found. Please install Chrome or Chromium on your system.');
}
/**
 * Launches a headless browser instance via CDP or connects to a remote debugging port.
 */
async function launchOrConnect(remoteDebuggingPort) {
    if (remoteDebuggingPort) {
        const browserWSEndpoint = `ws://127.0.0.1:${remoteDebuggingPort}/devtools/browser`;
        return await puppeteer_core_1.default.connect({ browserWSEndpoint });
    }
    const executablePath = findChromeExecutable();
    return await puppeteer_core_1.default.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
}
/**
 * Creates a new browser page configured with a specific viewport and navigates to the target URL.
 */
async function createSessionPage(browser, viewport, targetUrl) {
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
