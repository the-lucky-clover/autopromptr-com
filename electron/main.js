const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Keep a global reference of the window object
let mainWindow;
let localServer;
const LOCAL_PORT = 3001;

function createWindow() {
  // Configure security headers and CSP
  session.defaultSession.webSecurity = true;
  
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' http://localhost:* https://api.openai.com https://api.anthropic.com https://autopromptr-backend.onrender.com https://*.lovableproject.com; " +
          "frame-src 'none'; " +
          "object-src 'none'"
        ],
        'X-Frame-Options': ['DENY'],
        'X-Content-Type-Options': ['nosniff'],
        'Referrer-Policy': ['strict-origin-when-cross-origin']
      }
    });
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the local HTML file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startLocalServer() {
  const server = express();
  
  server.use(cors());
  server.use(express.json());

  // Health check endpoint
  server.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      version: app.getVersion(),
      platform: process.platform 
    });
  });

  // Prompt enhancement endpoint
  server.post('/enhance-prompt', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      // Here you would integrate with local AI models or send to remote service
      // For now, this is a placeholder that adds context to the prompt
      const enhancedPrompt = `Enhanced: ${prompt}\n\nContext: ${context || 'No context provided'}`;
      
      res.json({ 
        success: true, 
        enhancedPrompt,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Batch processing endpoint
  server.post('/process-batch', async (req, res) => {
    try {
      const { prompts, targetUrl, settings } = req.body;
      
      // Simulate batch processing
      const results = prompts.map((prompt, index) => ({
        id: prompt.id,
        status: 'completed',
        result: `Processed: ${prompt.text}`,
        order: index
      }));

      res.json({
        success: true,
        results,
        totalProcessed: prompts.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Web platform integration endpoint
  server.post('/receive-prompts', async (req, res) => {
    try {
      const { prompts, targetTool, metadata } = req.body;
      
      console.log(`📥 Received ${prompts.length} prompts from web platform for ${targetTool}`);
      
      // Process prompts for local tools (Cursor, Windsurf, VS Code)
      const results = await processPromptsForLocalTool(prompts, targetTool, metadata);
      
      res.json({
        success: true,
        results,
        message: `Successfully processed ${prompts.length} prompts for ${targetTool}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error processing web platform prompts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Local tool detection endpoint
  server.get('/detect-tools', async (req, res) => {
    try {
      const availableTools = await detectAvailableLocalTools();
      res.json({
        success: true,
        tools: availableTools,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        tools: []
      });
    }
  });
  server.post('/local-automation', async (req, res) => {
    try {
      const { targetPath, prompts } = req.body;
      
      // Here you would implement automation for local apps like Cursor, Windsurf
      // This is a placeholder implementation
      res.json({
        success: true,
        message: `Automation sent to ${targetPath}`,
        prompts: prompts.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  localServer = server.listen(LOCAL_PORT, 'localhost', () => {
    console.log(`🚀 AutoPromptr Companion Server running on http://localhost:${LOCAL_PORT}`);
    console.log(`🌐 Ready to receive prompts from web platform`);
    console.log(`🔗 Web Platform URL: https://1fec766e-41d8-4e0e-9e5c-277ce2efbe11.lovableproject.com`);
  });
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Text Files', extensions: ['txt'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Text Files', extensions: ['txt'] }
    ],
    properties: ['openFile']
  });
  return result;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  startLocalServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (localServer) {
    localServer.close();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (localServer) {
    localServer.close();
  }
});

// Helper functions for local tool integration
async function processPromptsForLocalTool(prompts, targetTool, metadata = {}) {
  console.log(`🔧 Processing ${prompts.length} prompts for ${targetTool}`);
  
  // This is where you would implement actual tool integration
  // For now, this is a simulation
  const results = prompts.map((prompt, index) => ({
    id: prompt.id || `prompt_${index}`,
    text: prompt.text || prompt,
    status: 'sent_to_tool',
    tool: targetTool,
    timestamp: new Date().toISOString()
  }));

  // Simulate tool-specific processing
  switch (targetTool.toLowerCase()) {
    case 'cursor':
      // Integration with Cursor IDE
      console.log('📝 Sending prompts to Cursor IDE...');
      break;
    case 'windsurf':
      // Integration with Windsurf IDE  
      console.log('🏄 Sending prompts to Windsurf IDE...');
      break;
    case 'vscode':
      // Integration with VS Code
      console.log('💻 Sending prompts to VS Code...');
      break;
    default:
      console.log(`🔧 Sending prompts to ${targetTool}...`);
  }

  return results;
}

async function detectAvailableLocalTools() {
  // This would check for installed IDEs on the system
  const tools = [];
  
  // Check for common IDE installations
  // This is a simplified example - real implementation would check actual paths
  const possibleTools = [
    { name: 'Cursor', path: '/cursor', available: false },
    { name: 'Windsurf', path: '/windsurf', available: false },
    { name: 'VS Code', path: '/vscode', available: false }
  ];

  // For demo purposes, assume all tools are potentially available
  possibleTools.forEach(tool => {
    tool.available = Math.random() > 0.3; // Random availability for demo
    tools.push(tool);
  });

  return tools;
}
