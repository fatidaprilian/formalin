#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { evaluateNarrativeBrief } from './layer0/detector.js';
import { saveSnapshot, loadSnapshots } from './layer1/snapshot.js';
import { extractDeltas } from './layer1/extractor.js';
import { loadProfile, saveProfile, getInitialProfile, updateProfile } from './layer1/aggregator.js';
import { compileBrief, compileChecklist } from './compiler/compiler.js';
import { generateAgentHooks } from './hooks/generator.js';

const program = new Command();

program
  .name('formalin')
  .description('A 100% Automatic Layered Anti-Genericness Engine for AI Coding Agents')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize local preference profile, agent hooks, and Git post-commit hook')
  .action(() => {
    const rootDir = process.cwd();
    const profile = getInitialProfile();
    saveProfile(profile, rootDir);

    const { claudePath, geminiPath, gitHookPath } = generateAgentHooks(rootDir);

    console.log('Formalin v1.0 initialized!');
    console.log(`- Preference profile: .formalin/profile.json`);
    console.log(`- Claude Code hooks: ${claudePath}`);
    console.log(`- Gemini CLI / Antigravity hooks: ${geminiPath}`);
    if (gitHookPath) {
      console.log(`- Git post-commit hook: ${gitHookPath}`);
    }
    console.log('\nFormalin is active and running 100% automatically across multiple agents!');
  });

program
  .command('install-plugin')
  .description('Install Formalin as a global plugin in ~/.gemini/config/plugins/formalin')
  .action(() => {
    const homeDir = os.homedir();
    const globalPluginsDir = path.join(homeDir, '.gemini', 'config', 'plugins');
    const targetPluginDir = path.join(globalPluginsDir, 'formalin');

    if (!fs.existsSync(globalPluginsDir)) {
      fs.mkdirSync(globalPluginsDir, { recursive: true });
    }

    const currentRepoDir = process.cwd();
    if (fs.existsSync(targetPluginDir)) {
      fs.rmSync(targetPluginDir, { recursive: true, force: true });
    }

    try {
      fs.symlinkSync(currentRepoDir, targetPluginDir, 'dir');
      console.log(`Successfully installed Formalin global plugin to ${targetPluginDir}`);
    } catch {
      // Fallback to copy if symlink fails
      fs.cpSync(currentRepoDir, targetPluginDir, { recursive: true });
      console.log(`Successfully copied Formalin global plugin to ${targetPluginDir}`);
    }
  });

program
  .command('gate')
  .argument('<briefText>', 'Creative brief text or filepath to evaluate against Layer 0 Genericness Gate')
  .description('Evaluate creative brief for genericness, buzzwords, and personal signal presence')
  .action((briefText: string) => {
    let content = briefText;
    if (fs.existsSync(briefText)) {
      content = fs.readFileSync(briefText, 'utf-8');
    }

    const result = evaluateNarrativeBrief(content);

    if (result.passed) {
      console.log(`Layer 0 Gate PASSED (Score: ${result.score}/100)`);
    } else {
      console.error(`Layer 0 Gate REJECTED (Score: ${result.score}/100)`);
      for (const reason of result.reasons) {
        console.error(`  - ${reason}`);
      }
      process.exit(1);
    }
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
      console.log('No shadow snapshots found in .formalin/shadow/. Triggered via agent hooks or git post-commit.');
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
