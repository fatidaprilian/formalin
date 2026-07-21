#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const client_js_1 = require("./cdp/client.js");
const responsive_js_1 = require("./responsive/responsive.js");
const mapper_js_1 = require("./mapper/mapper.js");
const intent_js_1 = require("./intent/intent.js");
const report_js_1 = require("./report/report.js");
const program = new commander_1.Command();
program
    .name('formalin')
    .description('The visual perception runtime for AI coding agents')
    .version('0.1.0');
program
    .command('inspect')
    .argument('<url>', 'Target URL of the web application to audit (e.g. http://localhost:3000)')
    .option('--output-dir <path>', 'Directory to write audit reports to', '.formalin')
    .option('--remote-debugging-port <port>', 'Connect to an existing Chrome remote debugging port', (val) => parseInt(val, 10))
    .option('--viewports <list>', 'Comma-separated list of viewport widths', '375,768,1024,1440')
    .option('--verbose', 'Enable verbose logging output')
    .action(async (targetUrl, options) => {
    try {
        const viewports = options.viewports
            .split(',')
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !isNaN(v));
        const repoDir = process.cwd();
        if (options.verbose) {
            console.log(`Auditing target URL: ${targetUrl}`);
            console.log(`Viewports: ${viewports.join(', ')}px`);
            console.log(`Output directory: ${options.outputDir}`);
        }
        console.log('Connecting to browser via Chrome DevTools Protocol...');
        const browser = await (0, client_js_1.launchOrConnect)(options.remoteDebuggingPort);
        console.log('Evaluating responsive viewports and scene graphs...');
        const { findings: rawFindings, sceneGraphs } = await (0, responsive_js_1.inspectViewports)(browser, targetUrl, viewports);
        console.log('Mapping element selectors to source code locations...');
        const mappedFindings = (0, mapper_js_1.resolveSourceLocations)(rawFindings, repoDir);
        console.log('Evaluating design intent & visual consistency...');
        const { metrics, findings } = (0, intent_js_1.evaluateIntentAndConsistency)(sceneGraphs, mappedFindings);
        const report = {
            schemaVersion: '1',
            targetUrl,
            timestamp: new Date().toISOString(),
            metrics,
            findings
        };
        console.log('Writing critique reports...');
        const absOutputDir = path_1.default.resolve(options.outputDir);
        const { jsonPath, mdPath } = (0, report_js_1.writeReports)(report, absOutputDir);
        await browser.close();
        console.log('Formalin audit complete!');
        console.log(`- Critique Database: ${jsonPath}`);
        console.log(`- Summary Report: ${mdPath}`);
    }
    catch (err) {
        console.error(`Audit failed: ${err.message}`);
        process.exit(1);
    }
});
program.parse(process.argv);
