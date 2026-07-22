#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { sanitizeClassString, sanitizeFileContent } from './sanitizer/sanitizer.js';

const program = new Command();

program
  .name('formalin')
  .description('Global Deterministic UI Sanitizer Plugin for AI Coding Agents')
  .version('0.1.0');

program
  .command('sanitize')
  .argument('<filepath>', 'Path to the TSX/JSX or CSS file to sanitize')
  .description('Sanitize AI Slop centroids in TSX/JSX class strings in place')
  .action((filepath: string) => {
    const absPath = path.resolve(process.cwd(), filepath);
    if (!fs.existsSync(absPath)) {
      console.error(`Error: File ${filepath} not found.`);
      process.exit(1);
    }

    const raw = fs.readFileSync(absPath, 'utf-8');
    const { content, totalTransformations } = sanitizeFileContent(raw);

    if (totalTransformations > 0) {
      fs.writeFileSync(absPath, content, 'utf-8');
      console.log(`Sanitized ${filepath}: Applied ${totalTransformations} deterministic token transformations.`);
    } else {
      console.log(`File ${filepath} is clean. No AI Slop centroids detected.`);
    }
  });

program
  .command('inspect-class')
  .argument('<classString>', 'Raw Tailwind / CSS class string to inspect and sanitize')
  .description('Inspect and transform a raw class string')
  .action((classString: string) => {
    const result = sanitizeClassString(classString);
    console.log(`Original:  "${result.originalClass}"`);
    console.log(`Sanitized: "${result.sanitizedClass}"`);
    if (result.transformations.length > 0) {
      console.log('Transformations:');
      for (const t of result.transformations) {
        console.log(`  - ${t}`);
      }
    } else {
      console.log('No transformations required.');
    }
  });

program.parse(process.argv);
