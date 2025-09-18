#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { runNexusInit } from './commands/NexusInitCommand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('nexus')
  .description('Quality-first workflow system with TDD enforcement and adaptive questioning')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize a new Nexus workflow project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --dir <directory>', 'Project directory', '.')
  .option('-f, --force', 'Force reinitialization if .nexus exists')
  .option('--skip-tdd', 'Skip TDD commitment (not recommended)', false)
  .action(async (options) => {
    const result = await runNexusInit({
      projectName: options.name,
      projectPath: options.dir,
      force: options.force,
      skipTddCommitment: options.skipTdd,
      verbose: true,
    });

    if (!result.success) {
      process.exit(1);
    }
  });

program
  .command('brainstorm')
  .description('Start adaptive brainstorming session')
  .option('-c, --context <file>', 'Context file path')
  .option('-o, --output <file>', 'Output file path', 'brainstorm.md')
  .action(async (options) => {
    console.log(chalk.cyan('Starting brainstorm session...'));
    console.log('Options:', options);
    // Implementation will be added in nexus-brainstorm command task
  });

program
  .command('specify')
  .description('Generate detailed specifications from brainstorm')
  .option('-i, --input <file>', 'Brainstorm input file', 'brainstorm.md')
  .option('-o, --output <file>', 'Specification output file', 'specification.md')
  .action(async (options) => {
    console.log(chalk.green('Generating specifications...'));
    console.log('Options:', options);
    // Implementation will be added in nexus-specify command task
  });

program
  .command('decompose')
  .description('Decompose specifications into atomic tasks')
  .option('-i, --input <file>', 'Specification input file', 'specification.md')
  .option('-o, --output <directory>', 'Output directory for task files', '.')
  .action(async (options) => {
    console.log(chalk.yellow('Decomposing into tasks...'));
    console.log('Options:', options);
    // Implementation will be added in nexus-decompose command task
  });

program
  .command('implement')
  .description('Implement tasks with TDD enforcement')
  .option('-t, --task <file>', 'Task file to implement')
  .option('--no-tdd', 'Disable TDD enforcement (not recommended)')
  .action(async (options) => {
    if (!options.tdd) {
      console.log(chalk.red('WARNING: TDD enforcement disabled. This violates Nexus constitution.'));
    }
    console.log(chalk.magenta('Implementing task...'));
    console.log('Options:', options);
    // Implementation will be added in nexus-implement command task
  });

program.parse(process.argv);