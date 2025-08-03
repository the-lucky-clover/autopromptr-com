const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Keep a global reference of the window object
let mainWindow;
let localServer;
const LOCAL_PORT = 3001;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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

  // Local automation endpoint for connecting to local apps
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
    console.log(`AutoPromptr Companion Server running on http://localhost:${LOCAL_PORT}`);
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
