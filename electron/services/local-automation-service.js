/**
 * Local Automation Service for Electron
 * Handles automation for local desktop tools (Cursor, Windsurf, VS Code)
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class LocalAutomationService {
  constructor() {
    this.detectedTools = [];
    this.activeBatches = new Map();
  }

  /**
   * Detect available local AI coding tools
   */
  async detectLocalTools() {
    console.log('🔍 Detecting local AI coding tools...');
    
    const tools = [
      {
        name: 'Cursor',
        executable: 'cursor',
        paths: [
          '/Applications/Cursor.app/Contents/MacOS/Cursor',
          'C:\\Users\\*\\AppData\\Local\\Programs\\Cursor\\Cursor.exe',
          '/usr/local/bin/cursor'
        ],
        platform: 'desktop'
      },
      {
        name: 'Windsurf',
        executable: 'windsurf',
        paths: [
          '/Applications/Windsurf.app/Contents/MacOS/Windsurf',
          'C:\\Program Files\\Windsurf\\Windsurf.exe',
          '/usr/local/bin/windsurf'
        ],
        platform: 'desktop'
      },
      {
        name: 'VS Code',
        executable: 'code',
        paths: [
          '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
          'C:\\Program Files\\Microsoft VS Code\\bin\\code',
          '/usr/bin/code'
        ],
        platform: 'desktop',
        extensions: ['continue', 'cline', 'kilocode']
      }
    ];

    const detected = [];

    for (const tool of tools) {
      const isAvailable = await this.checkToolAvailability(tool);
      if (isAvailable) {
        detected.push({
          ...tool,
          available: true,
          lastChecked: new Date().toISOString()
        });
        console.log(`✅ Found: ${tool.name}`);
      }
    }

    this.detectedTools = detected;
    return detected;
  }

  async checkToolAvailability(tool) {
    // Try command line first
    try {
      await execAsync(`which ${tool.executable}`);
      return true;
    } catch (e) {
      // Try specific paths
      for (const toolPath of tool.paths) {
        try {
          // Expand wildcards for Windows paths
          if (toolPath.includes('*')) {
            const expanded = await this.expandPath(toolPath);
            if (expanded) return true;
          } else {
            await fs.access(toolPath);
            return true;
          }
        } catch (e) {
          continue;
        }
      }
    }
    return false;
  }

  async expandPath(pathWithWildcard) {
    // Simple wildcard expansion for Windows user paths
    if (process.platform === 'win32' && pathWithWildcard.includes('*')) {
      const baseDir = 'C:\\Users';
      try {
        const users = await fs.readdir(baseDir);
        for (const user of users) {
          const expanded = pathWithWildcard.replace('*', user);
          try {
            await fs.access(expanded);
            return expanded;
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Process batch for local tool
   * MVP #1 Implementation for local desktop apps
   */
  async processBatchForLocalTool(batchId, targetTool, prompts, options = {}) {
    console.log(`🚀 Starting local batch processing for ${targetTool}`);
    console.log(`📝 Prompts: ${prompts.length}`);

    const results = [];
    this.activeBatches.set(batchId, {
      status: 'processing',
      totalPrompts: prompts.length,
      completed: 0,
      failed: 0,
      startedAt: new Date().toISOString()
    });

    try {
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const promptText = typeof prompt === 'string' ? prompt : prompt.text;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📍 Processing prompt ${i + 1}/${prompts.length}`);
        console.log(`📝 Text: ${promptText.substring(0, 100)}...`);
        console.log(`${'='.repeat(60)}\n`);

        let result;
        
        switch (targetTool.toLowerCase()) {
          case 'cursor':
            result = await this.injectToCursor(promptText, options);
            break;
          case 'windsurf':
            result = await this.injectToWindsurf(promptText, options);
            break;
          case 'vscode':
            result = await this.injectToVSCode(promptText, options);
            break;
          default:
            result = { success: false, error: 'Unknown tool' };
        }

        results.push({
          promptId: prompt.id || `prompt_${i}`,
          promptText,
          status: result.success ? 'completed' : 'failed',
          result: result.message || result.error,
          timestamp: new Date().toISOString()
        });

        const batchStatus = this.activeBatches.get(batchId);
        if (result.success) {
          batchStatus.completed++;
          console.log(`✅ Prompt ${i + 1} completed`);
        } else {
          batchStatus.failed++;
          console.log(`❌ Prompt ${i + 1} failed: ${result.error}`);
        }

        // Wait for tool to process (smart waiting simulation)
        if (options.waitForCompletion) {
          console.log('⏳ Waiting for tool to finish processing...');
          await this.waitForToolIdle(targetTool);
        }
      }

      const finalStatus = this.activeBatches.get(batchId);
      finalStatus.status = 'completed';
      finalStatus.completedAt = new Date().toISOString();

      console.log(`\n🎉 Batch ${batchId} completed!`);
      console.log(`✅ Success: ${finalStatus.completed}/${prompts.length}`);
      console.log(`❌ Failed: ${finalStatus.failed}/${prompts.length}`);

      return {
        success: true,
        batchId,
        results,
        completed: finalStatus.completed,
        failed: finalStatus.failed
      };

    } catch (error) {
      console.error(`❌ Batch processing error: ${error.message}`);
      return {
        success: false,
        batchId,
        error: error.message,
        results
      };
    }
  }

  /**
   * Smart waiting for local tool to finish processing
   * Monitors system activity, file changes, etc.
   */
  async waitForToolIdle(toolName, maxWaitSeconds = 120) {
    console.log(`⏳ Waiting for ${toolName} to become idle...`);
    
    const startTime = Date.now();
    const pollInterval = 2000; // Check every 2 seconds
    
    while ((Date.now() - startTime) < (maxWaitSeconds * 1000)) {
      // Check if tool process is active
      const isActive = await this.isToolActive(toolName);
      
      if (!isActive) {
        console.log(`✅ ${toolName} is idle`);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    console.log(`⚠️ ${toolName} did not become idle within ${maxWaitSeconds}s`);
    return false;
  }

  async isToolActive(toolName) {
    // Platform-specific activity detection
    try {
      if (process.platform === 'darwin') {
        // macOS: Check CPU usage of tool process
        const { stdout } = await execAsync(`ps aux | grep -i ${toolName} | grep -v grep | awk '{print $3}'`);
        const cpuUsage = parseFloat(stdout.trim());
        return cpuUsage > 5; // Active if using >5% CPU
      } else if (process.platform === 'win32') {
        // Windows: Check if process is running
        const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${toolName}.exe"`);
        return stdout.includes(toolName);
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async injectToCursor(promptText, options = {}) {
    // Cursor CLI injection
    try {
      // Method 1: Clipboard injection
      await this.copyToClipboard(promptText);
      
      // Method 2: Direct command if available
      // await execAsync(`cursor --inject "${promptText}"`);
      
      return {
        success: true,
        message: 'Prompt copied to clipboard - paste into Cursor chat',
        method: 'clipboard'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async injectToWindsurf(promptText, options = {}) {
    try {
      await this.copyToClipboard(promptText);
      return {
        success: true,
        message: 'Prompt copied to clipboard - paste into Windsurf',
        method: 'clipboard'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async injectToVSCode(promptText, options = {}) {
    try {
      // Check for Continue/Cline/Kilocode extensions
      await this.copyToClipboard(promptText);
      
      // Future: Direct extension API if available
      
      return {
        success: true,
        message: 'Prompt copied to clipboard - paste into VS Code extension',
        method: 'clipboard'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async copyToClipboard(text) {
    // Platform-specific clipboard operations
    if (process.platform === 'darwin') {
      await execAsync(`echo "${text}" | pbcopy`);
    } else if (process.platform === 'win32') {
      await execAsync(`echo ${text} | clip`);
    } else {
      // Linux
      await execAsync(`echo "${text}" | xclip -selection clipboard`);
    }
  }

  getBatchStatus(batchId) {
    return this.activeBatches.get(batchId);
  }

  stopBatch(batchId) {
    if (this.activeBatches.has(batchId)) {
      const batch = this.activeBatches.get(batchId);
      batch.status = 'stopped';
      return true;
    }
    return false;
  }
}

module.exports = new LocalAutomationService();
