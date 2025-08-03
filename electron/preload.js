const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
});

// Expose a safe API for making requests to the local server
contextBridge.exposeInMainWorld('localAPI', {
  healthCheck: () => fetch('http://localhost:3001/health').then(r => r.json()),
  enhancePrompt: (prompt, context) => 
    fetch('http://localhost:3001/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    }).then(r => r.json()),
  processBatch: (prompts, targetUrl, settings) =>
    fetch('http://localhost:3001/process-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompts, targetUrl, settings })
    }).then(r => r.json()),
  localAutomation: (targetPath, prompts) =>
    fetch('http://localhost:3001/local-automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath, prompts })
    }).then(r => r.json())
});