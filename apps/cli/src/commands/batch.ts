#!/usr/bin/env node
/**
 * Batch management commands for AutoPromptr CLI
 */

import { Command } from 'commander';
import { AutoPromptClient } from '../client/AutoPromptClient';
import { LocalOrchestrator } from '../orchestrator/LocalOrchestrator';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const client = new AutoPromptClient();
const orchestrator = new LocalOrchestrator();

export const batchCommand = new Command('batch')
  .description('Manage batch jobs');

// Create batch from file
batchCommand
  .command('create')
  .description('Create a new batch job from a file')
  .argument('<file>', 'Prompt file (JSON, YAML, or TXT)')
  .option('-n, --name <name>', 'Batch name')
  .option('-d, --description <desc>', 'Batch description')
  .option('-t, --target <target>', 'Target platform', 'web')
  .action(async (file: string, options) => {
    try {
      const filePath = path.resolve(file);
      const content = await fs.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      let prompts: Array<{text: string; platform?: string}> = [];
      
      if (ext === '.json') {
        const data = JSON.parse(content);
        prompts = Array.isArray(data) ? data : [data];
      } else if (ext === '.yaml' || ext === '.yml') {
        const data = yaml.load(content) as any;
        prompts = Array.isArray(data) ? data : [data];
      } else {
        // Plain text - split by double newlines
        const texts = content.split('\n\n').filter(t => t.trim());
        prompts = texts.map(text => ({ text: text.trim(), platform: options.target }));
      }
      
      // Validate prompts
      prompts = prompts.map(p => ({
        text: typeof p === 'string' ? p : p.text,
        platform: p.platform || options.target
      }));
      
      const name = options.name || `Batch from ${path.basename(filePath)}`;
      const description = options.description || `Generated from ${filePath}`;
      
      console.log(`Creating batch "${name}" with ${prompts.length} prompts...`);
      
      const result = await client.createBatch(name, prompts, description);
      
      console.log(`✅ Batch created successfully:`);
      console.log(`   Job ID: ${result.job_id}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.message}`);
      
    } catch (error) {
      console.error('❌ Error creating batch:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Run batch
batchCommand
  .command('run')
  .description('Run a batch job')
  .argument('<jobId>', 'Job ID to run')
  .option('-w, --watch', 'Watch for status updates')
  .action(async (jobId: string, options) => {
    try {
      console.log(`🚀 Starting batch job ${jobId}...`);
      
      const result = await client.runBatch(jobId);
      
      console.log(`✅ Batch started:`);
      console.log(`   Job ID: ${result.job_id}`);
      console.log(`   Status: ${result.status}`);
      
      if (options.watch) {
        console.log('👀 Watching for updates (Ctrl+C to stop)...\n');
        
        const pollInterval = setInterval(async () => {
          try {
            const status = await client.getBatchStatus(jobId);
            const progress = status.progress;
            
            console.log(`Status: ${status.job.status} | Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
            
            if (['completed', 'failed', 'stopped'].includes(status.job.status)) {
              clearInterval(pollInterval);
              console.log(`\n🏁 Batch finished with status: ${status.job.status}`);
              
              if (status.job.status === 'completed') {
                console.log('✅ All tasks completed successfully!');
              } else if (status.job.status === 'failed') {
                console.log(`❌ Batch failed. Failed tasks: ${progress.failed}`);
              }
            }
          } catch (err) {
            console.error('Error polling status:', err instanceof Error ? err.message : err);
          }
        }, 2000);
        
        // Handle Ctrl+C
        process.on('SIGINT', () => {
          clearInterval(pollInterval);
          console.log('\n👋 Stopped watching');
          process.exit(0);
        });
      }
      
    } catch (error) {
      console.error('❌ Error running batch:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List batches
batchCommand
  .command('list')
  .description('List all batch jobs')
  .option('-a, --all', 'Show all jobs (including completed)')
  .action(async (options) => {
    try {
      const data = await client.listBatches();
      
      console.log('📋 Batch Jobs:\n');
      
      if (data.active_jobs.length > 0) {
        console.log('🔄 Active Jobs:');
        data.active_jobs.forEach(job => {
          console.log(`   ${job.job_id} - ${job.name} (${job.status})`);
          console.log(`      Created: ${new Date(job.created_at).toLocaleString()}`);
          console.log(`      Tasks: ${job.tasks.length}`);
          console.log('');
        });
      }
      
      if (options.all && data.job_history.length > 0) {
        console.log('📚 Job History:');
        data.job_history.forEach(job => {
          console.log(`   ${job.job_id} - ${job.name} (${job.status})`);
          console.log(`      Created: ${new Date(job.created_at).toLocaleString()}`);
          if (job.completed_at) {
            console.log(`      Completed: ${new Date(job.completed_at).toLocaleString()}`);
          }
          console.log(`      Tasks: ${job.tasks.length}`);
          console.log('');
        });
      }
      
      if (data.active_jobs.length === 0 && data.job_history.length === 0) {
        console.log('   No batch jobs found');
      }
      
    } catch (error) {
      console.error('❌ Error listing batches:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Get batch status
batchCommand
  .command('status')
  .description('Get status of a batch job')
  .argument('<jobId>', 'Job ID to check')
  .option('-t, --tasks', 'Show individual task details')
  .action(async (jobId: string, options) => {
    try {
      const status = await client.getBatchStatus(jobId);
      const job = status.job;
      const progress = status.progress;
      
      console.log(`📊 Batch Status: ${job.name}`);
      console.log(`   Job ID: ${job.job_id}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Created: ${new Date(job.created_at).toLocaleString()}`);
      
      if (job.completed_at) {
        console.log(`   Completed: ${new Date(job.completed_at).toLocaleString()}`);
      }
      
      console.log(`   Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
      
      if (progress.failed > 0) {
        console.log(`   Failed: ${progress.failed}`);
      }
      
      if (options.tasks) {
        console.log('\n📝 Tasks:');
        job.tasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.status.toUpperCase()}`);
          console.log(`      Platform: ${task.platform}`);
          console.log(`      Prompt: ${task.prompt.substring(0, 100)}${task.prompt.length > 100 ? '...' : ''}`);
          
          if (task.error) {
            console.log(`      Error: ${task.error}`);
          }
          
          console.log('');
        });
      }
      
    } catch (error) {
      console.error('❌ Error getting batch status:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Stop batch
batchCommand
  .command('stop')
  .description('Stop a running batch job')
  .argument('<jobId>', 'Job ID to stop')
  .action(async (jobId: string) => {
    try {
      const result = await client.stopBatch(jobId);
      
      console.log(`🛑 Batch stopped:`);
      console.log(`   Job ID: ${result.job_id}`);
      console.log(`   Status: ${result.status}`);
      
    } catch (error) {
      console.error('❌ Error stopping batch:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Export batch results
batchCommand
  .command('export')
  .description('Export batch results')
  .argument('<jobId>', 'Job ID to export')
  .option('-f, --format <format>', 'Export format (json, csv, yaml)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .action(async (jobId: string, options) => {
    try {
      const status = await client.getBatchStatus(jobId);
      const job = status.job;
      
      const exportData = {
        job_id: job.job_id,
        name: job.name,
        description: job.description,
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
        tasks: job.tasks.map(task => ({
          task_id: task.task_id,
          prompt: task.prompt,
          platform: task.platform,
          status: task.status,
          result: task.result,
          error: task.error,
          created_at: task.created_at,
          completed_at: task.completed_at
        }))
      };
      
      let output: string;
      let filename = options.output || `batch_${jobId}.${options.format}`;
      
      switch (options.format.toLowerCase()) {
        case 'json':
          output = JSON.stringify(exportData, null, 2);
          break;
        case 'yaml':
          output = yaml.dump(exportData);
          break;
        case 'csv':
          // Simple CSV export of tasks
          const headers = ['task_id', 'prompt', 'platform', 'status', 'result', 'error'];
          const rows = job.tasks.map(task => [
            task.task_id,
            `"${task.prompt.replace(/"/g, '""')}"`,
            task.platform,
            task.status,
            `"${(task.result || '').replace(/"/g, '""')}"`,
            `"${(task.error || '').replace(/"/g, '""')}"`
          ]);
          output = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
          filename = filename.replace('.csv', '') + '.csv';
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
      
      await fs.writeFile(filename, output, 'utf-8');
      
      console.log(`✅ Batch results exported to: ${filename}`);
      console.log(`   Format: ${options.format.toUpperCase()}`);
      console.log(`   Tasks: ${job.tasks.length}`);
      
    } catch (error) {
      console.error('❌ Error exporting batch:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });