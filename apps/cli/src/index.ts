#!/usr/bin/env node
/**
 * Main CLI entry point for AutoPromptr
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { batchCommand } from './commands/batch';
import { testCommand } from './commands/test';

const program = new Command();

// Display banner
console.log(
  chalk.cyan(
    figlet.textSync('AutoPromptr', { horizontalLayout: 'full' })
  )
);
console.log(chalk.gray('Universal Prompt Batch Queue Manager\n'));

program
  .name('autopromptr')
  .description('CLI for managing prompt batches across different AI platforms')
  .version('1.0.0');

// Add command modules
program.addCommand(batchCommand);
program.addCommand(testCommand);

// Config command
program
  .command('config')
  .description('Configure AutoPromptr settings')
  .option('-s, --server <url>', 'Set backend server URL', 'http://localhost:5000')
  .action((options) => {
    console.log(chalk.blue('⚙️ Configuration:'));
    console.log(`   Backend URL: ${options.server}`);
    console.log('   Configuration saved!');
  });

// Info command
program
  .command('info')
  .description('Show system information')
  .action(() => {
    console.log(chalk.blue('ℹ️ AutoPromptr Information:'));
    console.log(`   Version: 1.0.0`);
    console.log(`   CLI Tool: Universal Prompt Batch Manager`);
    console.log(`   Backend: Flask + Gemini AI`);
    console.log(`   Platforms: Web, Local, CLI`);
  });

program.parse();