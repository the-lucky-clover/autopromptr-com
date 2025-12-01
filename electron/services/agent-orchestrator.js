/**
 * Advanced Agent Orchestration Service for AutoPromptr Electron Companion
 * Coordinates multiple AI coding assistants for parallel and sequential task execution
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

const execAsync = promisify(exec);

// ===== AGENT ORCHESTRATION TYPES =====

/**
 * @typedef {Object} Agent
 * @property {string} id - Unique agent identifier
 * @property {string} tool - Tool name (cursor, windsurf, vscode)
 * @property {string} executable - Path to executable
 * @property {boolean} available - Whether agent is available
 * @property {string} status - Current status (idle, busy, error)
 * @property {string|null} currentTask - Current task ID
 * @property {number} tasksCompleted - Number of completed tasks
 * @property {number} tasksFailed - Number of failed tasks
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} type - Task type (prompt, file_edit, batch, analysis)
 * @property {string} content - Task content/prompt
 * @property {string} priority - Priority level (low, normal, high, urgent)
 * @property {string} status - Task status (pending, assigned, processing, completed, failed)
 * @property {string|null} assignedAgent - Assigned agent ID
 * @property {number} retryCount - Number of retry attempts
 * @property {number} maxRetries - Maximum retry attempts
 * @property {Object} metadata - Additional task metadata
 */

/**
 * @typedef {Object} OrchestrationStrategy
 * @property {string} mode - Orchestration mode (parallel, sequential, load_balanced, priority_based)
 * @property {number} maxConcurrent - Maximum concurrent agents
 * @property {boolean} failover - Enable failover to other agents
 * @property {boolean} autoRetry - Automatically retry failed tasks
 * @property {number} timeout - Task timeout in milliseconds
 */

// ===== AGENT ORCHESTRATOR CLASS =====

class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    
    /** @type {Map<string, Agent>} */
    this.agents = new Map();
    
    /** @type {Map<string, Task>} */
    this.tasks = new Map();
    
    /** @type {Array<string>} */
    this.taskQueue = [];
    
    /** @type {OrchestrationStrategy} */
    this.strategy = {
      mode: 'load_balanced',
      maxConcurrent: 3,
      failover: true,
      autoRetry: true,
      timeout: 300000, // 5 minutes
    };
    
    this.initialized = false;
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgTaskDuration: 0,
    };
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize the orchestrator and detect available agents
   */
  async initialize() {
    if (this.initialized) {
      return { success: true, agents: Array.from(this.agents.values()) };
    }

    try {
      const detectedTools = await this.detectTools();
      
      // Create agents for each detected tool
      detectedTools.forEach((tool, index) => {
        const agentId = `${tool.name}_agent_${index}`;
        this.agents.set(agentId, {
          id: agentId,
          tool: tool.name,
          executable: tool.path,
          available: true,
          status: 'idle',
          currentTask: null,
          tasksCompleted: 0,
          tasksFailed: 0,
        });
      });

      this.initialized = true;
      this.emit('initialized', { agentCount: this.agents.size });
      
      console.log(`🤖 Agent Orchestrator initialized with ${this.agents.size} agents`);
      return { success: true, agents: Array.from(this.agents.values()) };
    } catch (error) {
      console.error('❌ Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  /**
   * Detect available AI coding tools on the system
   */
  async detectTools() {
    const tools = [];
    const platform = os.platform();

    // Detect Cursor
    const cursorPaths = platform === 'darwin' 
      ? ['/Applications/Cursor.app/Contents/MacOS/Cursor']
      : platform === 'win32'
      ? ['C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Programs\\cursor\\Cursor.exe']
      : ['/usr/bin/cursor', '/usr/local/bin/cursor'];

    for (const cursorPath of cursorPaths) {
      try {
        await fs.access(cursorPath);
        tools.push({ name: 'cursor', path: cursorPath, type: 'local' });
        break;
      } catch {}
    }

    // Detect Windsurf
    const windsurfPaths = platform === 'darwin'
      ? ['/Applications/Windsurf.app/Contents/MacOS/Windsurf']
      : platform === 'win32'
      ? ['C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Programs\\windsurf\\Windsurf.exe']
      : ['/usr/bin/windsurf', '/usr/local/bin/windsurf'];

    for (const windsurfPath of windsurfPaths) {
      try {
        await fs.access(windsurfPath);
        tools.push({ name: 'windsurf', path: windsurfPath, type: 'local' });
        break;
      } catch {}
    }

    // Detect VS Code
    const vscodePaths = platform === 'darwin'
      ? ['/Applications/Visual Studio Code.app/Contents/MacOS/Electron']
      : platform === 'win32'
      ? ['C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe']
      : ['/usr/bin/code', '/usr/local/bin/code'];

    for (const vscodePath of vscodePaths) {
      try {
        await fs.access(vscodePath);
        tools.push({ name: 'vscode', path: vscodePath, type: 'local' });
        break;
      } catch {}
    }

    return tools;
  }

  // ===== TASK MANAGEMENT =====

  /**
   * Submit a new task to the orchestrator
   */
  async submitTask(taskData) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      type: taskData.type || 'prompt',
      content: taskData.content,
      priority: taskData.priority || 'normal',
      status: 'pending',
      assignedAgent: null,
      retryCount: 0,
      maxRetries: taskData.maxRetries || 3,
      metadata: taskData.metadata || {},
      createdAt: Date.now(),
    };

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    this.stats.totalTasks++;

    this.emit('task_submitted', { taskId, task });
    
    // Trigger task processing
    this.processQueue();

    return { taskId, status: 'queued' };
  }

  /**
   * Submit a batch of tasks
   */
  async submitBatch(tasks, options = {}) {
    const batchId = `batch_${Date.now()}`;
    const taskIds = [];

    for (const taskData of tasks) {
      const result = await this.submitTask({
        ...taskData,
        metadata: {
          ...taskData.metadata,
          batchId,
          batchIndex: taskIds.length,
        },
      });
      taskIds.push(result.taskId);
    }

    // Execute based on strategy
    if (options.sequential || this.strategy.mode === 'sequential') {
      await this.executeSequential(taskIds);
    } else {
      await this.executeParallel(taskIds);
    }

    return { batchId, taskIds, status: 'processing' };
  }

  /**
   * Process the task queue
   */
  async processQueue() {
    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const taskA = this.tasks.get(a);
      const taskB = this.tasks.get(b);
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[taskA.priority] - priorityOrder[taskB.priority];
    });

    // Get available agents
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle' && agent.available);

    // Assign tasks to available agents (up to maxConcurrent)
    const concurrentCount = Array.from(this.agents.values())
      .filter(agent => agent.status === 'busy').length;

    if (concurrentCount >= this.strategy.maxConcurrent) {
      return; // Already at max concurrency
    }

    const tasksToAssign = Math.min(
      this.taskQueue.length,
      availableAgents.length,
      this.strategy.maxConcurrent - concurrentCount
    );

    for (let i = 0; i < tasksToAssign; i++) {
      const taskId = this.taskQueue.shift();
      const agent = availableAgents[i];
      await this.assignTask(taskId, agent.id);
    }
  }

  /**
   * Assign a task to a specific agent
   */
  async assignTask(taskId, agentId) {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);

    if (!task || !agent) {
      console.error('❌ Task or agent not found:', { taskId, agentId });
      return;
    }

    // Update task and agent status
    task.status = 'assigned';
    task.assignedAgent = agentId;
    agent.status = 'busy';
    agent.currentTask = taskId;

    this.emit('task_assigned', { taskId, agentId, task, agent });

    // Execute the task
    await this.executeTask(taskId);
  }

  /**
   * Execute a task on its assigned agent
   */
  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(task.assignedAgent);

    task.status = 'processing';
    task.startedAt = Date.now();

    this.emit('task_started', { taskId, agentId: agent.id });

    try {
      const timeout = this.strategy.timeout;
      const result = await Promise.race([
        this.runTaskOnAgent(task, agent),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Task timeout')), timeout)
        ),
      ]);

      // Task completed successfully
      task.status = 'completed';
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.startedAt;
      task.result = result;

      agent.status = 'idle';
      agent.currentTask = null;
      agent.tasksCompleted++;

      this.stats.completedTasks++;
      this.updateAvgDuration(task.duration);

      this.emit('task_completed', { taskId, agentId: agent.id, result });

    } catch (error) {
      console.error(`❌ Task ${taskId} failed on agent ${agent.id}:`, error);

      task.status = 'failed';
      task.error = error.message;
      task.failedAt = Date.now();

      agent.status = 'idle';
      agent.currentTask = null;
      agent.tasksFailed++;

      // Retry logic
      if (this.strategy.autoRetry && task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'pending';
        this.taskQueue.push(taskId);
        this.emit('task_retry', { taskId, retryCount: task.retryCount });
      } else if (this.strategy.failover) {
        // Try with a different agent
        task.assignedAgent = null;
        task.status = 'pending';
        this.taskQueue.push(taskId);
        this.emit('task_failover', { taskId, failedAgent: agent.id });
      } else {
        this.stats.failedTasks++;
        this.emit('task_failed', { taskId, agentId: agent.id, error: error.message });
      }
    }

    // Process next tasks in queue
    this.processQueue();
  }

  /**
   * Run a task on a specific agent using clipboard injection
   */
  async runTaskOnAgent(task, agent) {
    const { tool, executable } = agent;
    const { content, type } = task;

    console.log(`🚀 Running ${type} task on ${tool} agent...`);

    // Copy prompt to clipboard
    await this.copyToClipboard(content);

    // Launch or focus the tool
    if (os.platform() === 'darwin') {
      await execAsync(`open -a "${executable.replace('/Contents/MacOS/' + tool.charAt(0).toUpperCase() + tool.slice(1), '')}"`);
    } else if (os.platform() === 'win32') {
      await execAsync(`start "" "${executable}"`);
    }

    // Wait for tool to be ready
    await this.sleep(2000);

    // Simulate paste action (Cmd+V or Ctrl+V)
    const pasteKey = os.platform() === 'darwin' ? 'command+v' : 'ctrl+v';
    await this.simulateKeyPress(pasteKey);

    // Wait for Enter key
    await this.sleep(500);
    await this.simulateKeyPress('enter');

    // Monitor for completion (simplified - in production, use IPC or file watchers)
    const completionSignal = await this.waitForCompletion(agent, task);

    return {
      success: true,
      agent: agent.id,
      tool: agent.tool,
      duration: completionSignal.duration,
      output: completionSignal.output,
    };
  }

  /**
   * Wait for task completion signal
   */
  async waitForCompletion(agent, task) {
    const maxWait = this.strategy.timeout;
    const startTime = Date.now();
    const pollInterval = 2000;

    while (Date.now() - startTime < maxWait) {
      await this.sleep(pollInterval);

      // Check for completion indicators (simplified)
      // In production: monitor CPU usage, check file changes, use IPC, etc.
      const isIdle = await this.checkToolIdle(agent.tool);
      
      if (isIdle) {
        return {
          success: true,
          duration: Date.now() - startTime,
          output: 'Task completed',
        };
      }
    }

    throw new Error('Task completion timeout');
  }

  /**
   * Check if tool is idle
   */
  async checkToolIdle(toolName) {
    try {
      if (os.platform() === 'darwin') {
        const { stdout } = await execAsync(`ps aux | grep -i ${toolName} | grep -v grep`);
        // Simple heuristic: check CPU usage
        const lines = stdout.trim().split('\n');
        if (lines.length === 0) return true;
        
        const cpuUsage = parseFloat(lines[0].split(/\s+/)[2]);
        return cpuUsage < 5; // Less than 5% CPU = idle
      }
      return true; // Fallback
    } catch {
      return true;
    }
  }

  // ===== EXECUTION STRATEGIES =====

  /**
   * Execute tasks sequentially (one after another)
   */
  async executeSequential(taskIds) {
    for (const taskId of taskIds) {
      await new Promise((resolve) => {
        const checkStatus = setInterval(() => {
          const task = this.tasks.get(taskId);
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(checkStatus);
            resolve();
          }
        }, 1000);
      });
    }
  }

  /**
   * Execute tasks in parallel
   */
  async executeParallel(taskIds) {
    await Promise.allSettled(
      taskIds.map(taskId => new Promise((resolve) => {
        const checkStatus = setInterval(() => {
          const task = this.tasks.get(taskId);
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(checkStatus);
            resolve();
          }
        }, 1000);
      }))
    );
  }

  // ===== UTILITY FUNCTIONS =====

  async copyToClipboard(text) {
    if (os.platform() === 'darwin') {
      await execAsync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`);
    } else if (os.platform() === 'win32') {
      await execAsync(`echo ${text} | clip`);
    } else {
      await execAsync(`echo "${text}" | xclip -selection clipboard`);
    }
  }

  async simulateKeyPress(key) {
    // Placeholder - in production, use robotjs or other automation library
    console.log(`⌨️  Simulating key press: ${key}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateAvgDuration(duration) {
    const totalDuration = this.stats.avgTaskDuration * (this.stats.completedTasks - 1);
    this.stats.avgTaskDuration = (totalDuration + duration) / this.stats.completedTasks;
  }

  // ===== STATUS & MONITORING =====

  /**
   * Get current orchestration status
   */
  getStatus() {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());

    return {
      initialized: this.initialized,
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
        error: agents.filter(a => a.status === 'error').length,
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        processing: tasks.filter(t => t.status === 'processing').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
      },
      queue: {
        length: this.taskQueue.length,
      },
      stats: this.stats,
      strategy: this.strategy,
    };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Update orchestration strategy
   */
  updateStrategy(newStrategy) {
    this.strategy = { ...this.strategy, ...newStrategy };
    this.emit('strategy_updated', this.strategy);
  }
}

module.exports = AgentOrchestrator;
