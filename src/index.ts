#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { saveSnapshot, loadSnapshots } from './snapshot/snapshot.js';
import { extractDeltas } from './diff/extractor.js';
import { loadProfile, saveProfile, getInitialProfile, updateProfile } from './profile/aggregator.js';
import { compileBrief, compileChecklist } from './compiler/compiler.js';

const program = new Command();

program
  .name('formalin')
  .description('A Learned Design Preference Engine for AI Coding Agents')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize local preference profile and output agent hook configuration')
  .action(() => {
    const rootDir = process.cwd();
    const profile = getInitialProfile();
    saveProfile(profile, rootDir);

    console.log('Formalin preference profile initialized at .formalin/profile.json');
    console.log('\nTo enable write-time shadow snapshots automatically with Claude Code, add this to .claude/settings.json:');
    console.log(JSON.stringify({
      hooks: {
        PostToolUse: [
          {
            matcher: 'Write|Edit',
            hooks: [
              { type: 'command', command: 'npx formalin snapshot "$CLAUDE_TOOL_INPUT_FILE_PATH"' }
            ]
          }
        ]
      }
    }, null, 2));
  });

program
  .command('snapshot')
  .argument('<filepath>', 'Relative path of the frontend file to snapshot at write-time')
  .description('Save a write-time shadow snapshot of an AI-written file into .formalin/shadow/')
  .action((filepath: string) => {
    const snapshot = saveSnapshot(filepath);
    if (snapshot) {
      console.log(`Captured write-time shadow snapshot for ${filepath}`);
    } else {
      console.error(`Failed to snapshot file ${filepath}: File not found.`);
      process.exit(1);
    }
  });

program
  .command('record')
  .description('Record preference deltas by comparing committed files against write-time shadow snapshots')
  .action(() => {
    const rootDir = process.cwd();
    const snapshots = loadSnapshots(rootDir);

    if (snapshots.length === 0) {
      console.log('No shadow snapshots found in .formalin/shadow/. Run "formalin snapshot <file>" or trigger via agent hooks.');
      return;
    }

    let totalDeltas = 0;

    for (const snapshot of snapshots) {
      const currentFilePath = path.resolve(rootDir, snapshot.filePath);
      if (fs.existsSync(currentFilePath)) {
        const currentContent = fs.readFileSync(currentFilePath, 'utf-8');
        const deltas = extractDeltas(snapshot.content, currentContent);

        if (deltas.length > 0) {
          updateProfile(deltas, rootDir);
          totalDeltas += deltas.length;
          console.log(`Recorded ${deltas.length} preference signals from ${snapshot.filePath}:`);
          for (const d of deltas) {
            console.log(`  - [${d.dimension}] ${d.reason}`);
          }
        }
      }
    }

    if (totalDeltas === 0) {
      console.log('No preference deltas detected between shadow snapshots and committed files.');
    } else {
      console.log(`\nSuccessfully updated .formalin/profile.json with ${totalDeltas} preference signals.`);
    }
  });

program
  .command('brief')
  .description('Print compiled pre-generation design brief for session initiation')
  .action(() => {
    const rootDir = process.cwd();
    const profile = loadProfile(rootDir);
    console.log(compileBrief(profile));
  });

program
  .command('check')
  .description('Print compiled post-generation verification checklist for session conclusion')
  .action(() => {
    const rootDir = process.cwd();
    const profile = loadProfile(rootDir);
    console.log(compileChecklist(profile));
  });

program.parse(process.argv);
