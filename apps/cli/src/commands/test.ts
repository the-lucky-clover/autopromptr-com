#!/usr/bin/env node
/**
 * Test commands for AutoPromptr CLI
 */

import { Command } from 'commander';
import { AutoPromptClient } from '../client/AutoPromptClient';

const client = new AutoPromptClient();

export const testCommand = new Command('test')
  .description('Test various components and connections');

// Test backend connection
testCommand
  .command('connection')
  .description('Test connection to backend server')
  .action(async () => {
    try {
      console.log('🔌 Testing backend connection...');
      
      const health = await client.healthCheck();
      
      console.log('✅ Backend connection successful!');
      console.log(`   Service: ${health.service}`);
      console.log(`   Version: ${health.version}`);
      console.log(`   Status: ${health.status}`);
      
      if (health.services) {
        console.log('   Dependencies:');
        Object.entries(health.services).forEach(([service, status]) => {
          const icon = (status as any).status === 'healthy' ? '✅' : '❌';
          console.log(`     ${icon} ${service}: ${(status as any).status}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error instanceof Error ? error.message : error);
      console.error('   Make sure the backend server is running on http://localhost:5000');
      process.exit(1);
    }
  });

// Test Gemini AI
testCommand
  .command('gemini')
  .description('Test Gemini AI integration')
  .option('-p, --prompt <prompt>', 'Custom test prompt', 'Hello, this is a test.')
  .action(async (options) => {
    try {
      console.log('🤖 Testing Gemini AI integration...');
      console.log(`   Prompt: "${options.prompt}"`);
      
      const result = await client.testGemini(options.prompt);
      
      if (result.success) {
        console.log('✅ Gemini AI test successful!');
        console.log(`   Response: ${result.response}`);
        
        if (result.usage) {
          console.log(`   Token usage: ${result.usage.prompt_tokens} + ${result.usage.completion_tokens} tokens`);
        }
      } else {
        console.error('❌ Gemini AI test failed:', result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Gemini AI test failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Test full workflow
testCommand
  .command('workflow')
  .description('Test complete batch workflow')
  .action(async () => {
    try {
      console.log('🔄 Testing complete workflow...\n');
      
      // Step 1: Test connection
      console.log('1️⃣ Testing backend connection...');
      await client.healthCheck();
      console.log('   ✅ Backend connected\n');
      
      // Step 2: Create test batch
      console.log('2️⃣ Creating test batch...');
      const testPrompts = [
        { text: 'What is the capital of France?', platform: 'gemini' },
        { text: 'Explain quantum computing in simple terms', platform: 'gemini' }
      ];
      
      const batch = await client.createBatch('CLI Test Batch', testPrompts, 'Test batch created by CLI');
      console.log(`   ✅ Batch created: ${batch.job_id}\n`);
      
      // Step 3: Run batch
      console.log('3️⃣ Running batch...');
      await client.runBatch(batch.job_id);
      console.log('   ✅ Batch started\n');
      
      // Step 4: Monitor progress
      console.log('4️⃣ Monitoring progress...');
      let completed = false;
      let attempts = 0;
      const maxAttempts = 30; // 1 minute timeout
      
      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const status = await client.getBatchStatus(batch.job_id);
        const progress = status.progress;
        
        console.log(`   Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
        
        if (['completed', 'failed', 'stopped'].includes(status.job.status)) {
          completed = true;
          
          if (status.job.status === 'completed') {
            console.log('   ✅ Batch completed successfully!\n');
            
            // Show results
            console.log('📋 Results:');
            status.job.tasks.forEach((task, index) => {
              console.log(`   ${index + 1}. ${task.status.toUpperCase()}`);
              console.log(`      Prompt: ${task.prompt}`);
              if (task.result) {
                console.log(`      Response: ${task.result.substring(0, 100)}...`);
              }
              if (task.error) {
                console.log(`      Error: ${task.error}`);
              }
              console.log('');
            });
          } else {
            console.error(`   ❌ Batch ${status.job.status}`);
            process.exit(1);
          }
        }
        
        attempts++;
      }
      
      if (!completed) {
        console.error('   ⏰ Batch test timed out');
        process.exit(1);
      }
      
      console.log('🎉 Workflow test completed successfully!');
      
    } catch (error) {
      console.error('❌ Workflow test failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Performance test
testCommand
  .command('performance')
  .description('Run performance tests')
  .option('-c, --count <count>', 'Number of concurrent prompts', '5')
  .action(async (options) => {
    try {
      const count = parseInt(options.count);
      console.log(`⚡ Running performance test with ${count} concurrent prompts...\n`);
      
      // Create test prompts
      const prompts = Array.from({ length: count }, (_, i) => ({
        text: `Performance test prompt ${i + 1}: Generate a random fact about science.`,
        platform: 'gemini'
      }));
      
      const startTime = Date.now();
      
      // Create batch
      const batch = await client.createBatch('Performance Test Batch', prompts, `Performance test with ${count} prompts`);
      console.log(`✅ Batch created: ${batch.job_id}`);
      
      // Run batch
      await client.runBatch(batch.job_id);
      
      // Monitor completion
      let completed = false;
      while (!completed) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const status = await client.getBatchStatus(batch.job_id);
        const progress = status.progress;
        
        process.stdout.write(`\r   Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
        
        if (['completed', 'failed', 'stopped'].includes(status.job.status)) {
          completed = true;
          console.log('\n');
          
          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000;
          
          if (status.job.status === 'completed') {
            console.log('📊 Performance Results:');
            console.log(`   ✅ Total time: ${duration.toFixed(2)} seconds`);
            console.log(`   ✅ Average time per prompt: ${(duration / count).toFixed(2)} seconds`);
            console.log(`   ✅ Throughput: ${(count / duration).toFixed(2)} prompts/second`);
            console.log(`   ✅ Success rate: ${((progress.completed / progress.total) * 100).toFixed(1)}%`);
            
            if (progress.failed > 0) {
              console.log(`   ⚠️  Failed prompts: ${progress.failed}`);
            }
          } else {
            console.error(`   ❌ Performance test ${status.job.status}`);
            process.exit(1);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Performance test failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });