#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { launchOrConnect } from './cdp/client.js';
import { inspectViewports } from './responsive/responsive.js';
import { resolveSourceLocations } from './mapper/mapper.js';
import { evaluateIntentAndConsistency } from './intent/intent.js';
import { writeReports } from './report/report.js';
import { CritiqueReport } from './types.js';

const program = new Command();

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
  .action(async (targetUrl: string, options: any) => {
    try {
      const viewports = options.viewports
        .split(',')
        .map((v: string) => parseInt(v.trim(), 10))
        .filter((v: number) => !isNaN(v));
      const repoDir = process.cwd();

      if (options.verbose) {
        console.log(`Auditing target URL: ${targetUrl}`);
        console.log(`Viewports: ${viewports.join(', ')}px`);
        console.log(`Output directory: ${options.outputDir}`);
      }

      console.log('Connecting to browser via Chrome DevTools Protocol...');
      const browser = await launchOrConnect(options.remoteDebuggingPort);

      console.log('Evaluating responsive viewports and scene graphs...');
      const { findings: rawFindings, sceneGraphs } = await inspectViewports(browser, targetUrl, viewports);

      console.log('Mapping element selectors to source code locations...');
      const mappedFindings = resolveSourceLocations(rawFindings, repoDir);

      console.log('Evaluating design intent & visual consistency...');
      const { metrics, findings } = evaluateIntentAndConsistency(sceneGraphs, mappedFindings);

      const report: CritiqueReport = {
        schemaVersion: '1',
        targetUrl,
        timestamp: new Date().toISOString(),
        metrics,
        findings
      };

      console.log('Writing critique reports...');
      const absOutputDir = path.resolve(options.outputDir);
      const { jsonPath, mdPath } = writeReports(report, absOutputDir);

      await browser.close();

      console.log('Formalin audit complete!');
      console.log(`- Critique Database: ${jsonPath}`);
      console.log(`- Summary Report: ${mdPath}`);
    } catch (err: any) {
      console.error(`Audit failed: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
