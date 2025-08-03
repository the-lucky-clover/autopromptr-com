// Renderer process script for AutoPromptr Companion

let appVersion = '';
let serverStatus = 'disconnected';

// Initialize the app
async function initializeApp() {
    try {
        // Get app version
        appVersion = await window.electronAPI.getAppVersion();
        document.getElementById('version').textContent = appVersion;
        
        // Get platform
        document.getElementById('platform').textContent = getPlatformName();
        
        // Test server connection
        await testServerConnection();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        updateStatus('error', 'Initialization failed');
    }
}

function getPlatformName() {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('linux')) return 'Linux';
    return 'Unknown';
}

async function testServerConnection() {
    try {
        updateStatus('connecting', 'Testing connection...');
        const response = await window.localAPI.healthCheck();
        
        if (response.status === 'healthy') {
            updateStatus('connected', 'Server running');
            serverStatus = 'connected';
        } else {
            updateStatus('error', 'Server unhealthy');
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        updateStatus('error', 'Connection failed');
    }
}

function updateStatus(status, message) {
    const statusElement = document.getElementById('status-text');
    const statusDot = document.querySelector('.status-dot');
    
    statusElement.textContent = message;
    
    // Remove existing status classes
    statusDot.classList.remove('connected', 'connecting', 'error');
    
    // Add new status class
    statusDot.classList.add(status);
    
    // Update dot color based on status
    switch (status) {
        case 'connected':
            statusDot.style.background = '#10b981';
            break;
        case 'connecting':
            statusDot.style.background = '#f59e0b';
            break;
        case 'error':
            statusDot.style.background = '#ef4444';
            break;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Test connection button
    document.getElementById('test-connection').addEventListener('click', testServerConnection);
    
    // Enhance prompt button
    document.getElementById('enhance-prompt').addEventListener('click', async () => {
        const promptInput = document.getElementById('prompt-input');
        const contextInput = document.getElementById('context-input');
        const outputArea = document.getElementById('enhanced-output');
        const enhancedText = document.getElementById('enhanced-text');
        const button = document.getElementById('enhance-prompt');
        
        if (!promptInput.value.trim()) {
            alert('Please enter a prompt to enhance');
            return;
        }
        
        try {
            button.textContent = 'Enhancing...';
            button.disabled = true;
            
            const response = await window.localAPI.enhancePrompt(
                promptInput.value,
                contextInput.value
            );
            
            if (response.success) {
                enhancedText.textContent = response.enhancedPrompt;
                outputArea.style.display = 'block';
                outputArea.classList.add('success');
            } else {
                alert('Enhancement failed: ' + response.error);
            }
        } catch (error) {
            console.error('Enhancement failed:', error);
            alert('Enhancement failed: ' + error.message);
        } finally {
            button.textContent = 'Enhance Prompt';
            button.disabled = false;
        }
    });
    
    // Target app selection
    document.getElementById('target-app').addEventListener('change', (e) => {
        const customPath = document.getElementById('custom-path');
        if (e.target.value === '/custom') {
            customPath.style.display = 'block';
        } else {
            customPath.style.display = 'none';
        }
    });
    
    // Send automation button
    document.getElementById('send-automation').addEventListener('click', async () => {
        const targetApp = document.getElementById('target-app');
        const customPath = document.getElementById('custom-path');
        const promptInput = document.getElementById('prompt-input');
        const button = document.getElementById('send-automation');
        
        let targetPath = targetApp.value;
        if (targetPath === '/custom' && customPath.value.trim()) {
            targetPath = customPath.value.trim();
        }
        
        if (!promptInput.value.trim()) {
            alert('Please enter a prompt to send');
            return;
        }
        
        try {
            button.textContent = 'Sending...';
            button.disabled = true;
            
            const prompts = [{ 
                id: Date.now().toString(), 
                text: promptInput.value,
                order: 0
            }];
            
            const response = await window.localAPI.localAutomation(targetPath, prompts);
            
            if (response.success) {
                alert(`Successfully sent automation to ${targetPath}`);
            } else {
                alert('Automation failed: ' + response.error);
            }
        } catch (error) {
            console.error('Automation failed:', error);
            alert('Automation failed: ' + error.message);
        } finally {
            button.textContent = 'Send to Local App';
            button.disabled = false;
        }
    });
    
    // Connect to SaaS button
    document.getElementById('connect-saas').addEventListener('click', async () => {
        const saasUrl = document.getElementById('saas-url').value.trim();
        
        if (!saasUrl) {
            alert('Please enter a SaaS URL');
            return;
        }
        
        try {
            await window.electronAPI.openExternal(saasUrl);
        } catch (error) {
            console.error('Failed to open SaaS URL:', error);
            alert('Failed to open SaaS URL: ' + error.message);
        }
    });
});

// Handle app updates and notifications
window.addEventListener('online', () => {
    updateStatus('connected', 'Online - Server running');
});

window.addEventListener('offline', () => {
    updateStatus('error', 'Offline');
});

// Auto-refresh connection status every 30 seconds
setInterval(() => {
    if (serverStatus === 'connected') {
        testServerConnection();
    }
}, 30000);