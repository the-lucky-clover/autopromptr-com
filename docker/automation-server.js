// Dockerized Automation Server with Universal Platform Detection
const express = require('express');
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

class UniversalPlatformDetector {
  constructor() {
    this.platforms = new Map();
    this.loadPlatforms();
  }

  async loadPlatforms() {
    // Load platform configurations from D1 database
    try {
      const response = await fetch(process.env.D1_DATABASE_URL + '/platforms');
      const platforms = await response.json();
      
      platforms.forEach(platform => {
        this.platforms.set(platform.name, platform);
      });
      
      console.log(`Loaded ${platforms.length} platform configurations`);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  }

  async detectPlatform(url, page) {
    console.log(`Detecting platform for: ${url}`);
    
    // URL-based detection first (fastest)
    for (const [name, platform] of this.platforms) {
      if (platform.detection_method === 'url_match') {
        const rules = await this.getPlatformRules(platform.id);
        for (const rule of rules) {
          if (rule.rule_type === 'url_pattern') {
            const regex = new RegExp(rule.rule_value);
            if (regex.test(url)) {
              console.log(`Platform detected by URL: ${platform.display_name}`);
              return platform;
            }
          }
        }
      }
    }

    // DOM-based detection
    for (const [name, platform] of this.platforms) {
      if (platform.detection_method === 'dom_analysis') {
        const rules = await this.getPlatformRules(platform.id);
        let confidence = 0;
        let requiredRulesMet = true;

        for (const rule of rules) {
          if (rule.rule_type === 'css_selector') {
            try {
              const element = await page.$(rule.rule_value);
              if (element) {
                confidence += rule.weight;
              } else if (rule.is_required) {
                requiredRulesMet = false;
                break;
              }
            } catch (error) {
              console.warn(`CSS selector failed: ${rule.rule_value}`);
            }
          }
          
          if (rule.rule_type === 'text_pattern') {
            try {
              const content = await page.textContent('body');
              const regex = new RegExp(rule.rule_value, 'i');
              if (regex.test(content)) {
                confidence += rule.weight;
              }
            } catch (error) {
              console.warn(`Text pattern failed: ${rule.rule_value}`);
            }
          }
        }

        if (requiredRulesMet && confidence >= platform.confidence_threshold) {
          console.log(`Platform detected by DOM: ${platform.display_name} (confidence: ${confidence})`);
          return platform;
        }
      }
    }

    // Computer vision detection (for unknown platforms)
    return await this.detectByComputerVision(page);
  }

  async detectByComputerVision(page) {
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      
      // Use Workers AI for image analysis
      const response = await fetch(process.env.WORKERS_AI_URL + '/analyze-coding-interface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: screenshot
      });
      
      const analysis = await response.json();
      
      if (analysis.is_coding_interface && analysis.confidence > 0.7) {
        // Create dynamic platform entry
        const platform = {
          name: 'detected_' + Date.now(),
          display_name: analysis.platform_name || 'Unknown Coding Platform',
          base_url: page.url(),
          platform_type: 'web',
          category: 'ai_assistant',
          detection_method: 'computer_vision',
          confidence_threshold: 0.7,
          chat_input_selector: analysis.chat_input_selector,
          send_button_selector: analysis.send_button_selector
        };
        
        console.log(`New platform detected by AI: ${platform.display_name}`);
        return platform;
      }
    } catch (error) {
      console.warn('Computer vision detection failed:', error);
    }
    
    return null;
  }

  async getPlatformRules(platformId) {
    try {
      const response = await fetch(process.env.D1_DATABASE_URL + `/platform-rules/${platformId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to load platform rules:', error);
      return [];
    }
  }
}

class AutomationServer {
  constructor() {
    this.app = express();
    this.browsers = new Map();
    this.detector = new UniversalPlatformDetector();
    this.activeSessions = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Browser management
    this.app.post('/browser/launch', async (req, res) => {
      try {
        const { browserType = 'chromium', headless = true } = req.body;
        const sessionId = 'session_' + Date.now();
        
        const browser = await this.launchBrowser(browserType, headless);
        const page = await browser.newPage();
        
        this.activeSessions.set(sessionId, { browser, page, browserType });
        
        res.json({ sessionId, status: 'launched' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Platform detection
    this.app.post('/platform/detect', async (req, res) => {
      try {
        const { sessionId, url } = req.body;
        const session = this.activeSessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        await session.page.goto(url);
        await session.page.waitForLoadState('networkidle');
        
        const platform = await this.detector.detectPlatform(url, session.page);
        
        res.json({ platform, detected: !!platform });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Universal prompt submission
    this.app.post('/prompt/submit', async (req, res) => {
      try {
        const { sessionId, prompt, platform } = req.body;
        const session = this.activeSessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const result = await this.submitPrompt(session.page, prompt, platform);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Screenshot capture
    this.app.post('/screenshot', async (req, res) => {
      try {
        const { sessionId, fullPage = false } = req.body;
        const session = this.activeSessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        const screenshot = await session.page.screenshot({ 
          fullPage,
          type: 'png'
        });
        
        const filename = `screenshot_${Date.now()}.png`;
        const filepath = path.join('/app/data/screenshots', filename);
        
        await fs.writeFile(filepath, screenshot);
        
        res.json({ 
          screenshot: `/screenshots/${filename}`,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Session cleanup
    this.app.delete('/browser/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = this.activeSessions.get(sessionId);
        
        if (session) {
          await session.browser.close();
          this.activeSessions.delete(sessionId);
        }
        
        res.json({ status: 'closed' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.wss = new WebSocket.Server({ port: 3001 });
    
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          
          switch (message.type) {
            case 'batch_start':
              await this.handleBatchStart(ws, message);
              break;
            case 'batch_stop':
              await this.handleBatchStop(ws, message);
              break;
          }
        } catch (error) {
          ws.send(JSON.stringify({ error: error.message }));
        }
      });
    });
  }

  async launchBrowser(browserType, headless) {
    let browser;
    
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch({ 
          headless,
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        break;
      case 'webkit':
        browser = await webkit.launch({ 
          headless,
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        break;
      default:
        browser = await chromium.launch({ 
          headless,
          args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
    }
    
    return browser;
  }

  async submitPrompt(page, prompt, platform) {
    const startTime = Date.now();
    
    try {
      // Find chat input based on platform configuration
      let inputSelector = platform.chat_input_selector;
      
      if (!inputSelector) {
        // Try common selectors
        const commonSelectors = [
          'textarea[placeholder*="message"]',
          'input[placeholder*="message"]',
          '[data-testid="chat-input"]',
          '[data-testid="composer-input"]',
          'textarea[name="message"]',
          '#chat-input',
          '.chat-input'
        ];
        
        for (const selector of commonSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            inputSelector = selector;
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (!inputSelector) {
        throw new Error('Could not find chat input field');
      }

      // Clear and type the prompt
      await page.click(inputSelector);
      await page.keyboard.press('Control+A');
      await page.type(inputSelector, prompt);
      
      // Find and click send button
      let sendSelector = platform.send_button_selector;
      
      if (!sendSelector) {
        const commonSendSelectors = [
          'button[type="submit"]',
          'button:has-text("Send")',
          '[data-testid="send-button"]',
          'button[aria-label*="Send"]'
        ];
        
        for (const selector of commonSendSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 1000 });
            sendSelector = selector;
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (sendSelector) {
        await page.click(sendSelector);
      } else {
        // Fallback to Enter key
        await page.keyboard.press('Enter');
      }
      
      // Wait for response
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        executionTime,
        timestamp: new Date().toISOString(),
        platform: platform.display_name
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  async handleBatchStart(ws, message) {
    // Implementation for batch processing
    ws.send(JSON.stringify({
      type: 'batch_started',
      batchId: message.batchId
    }));
  }

  async handleBatchStop(ws, message) {
    // Implementation for batch stopping
    ws.send(JSON.stringify({
      type: 'batch_stopped',
      batchId: message.batchId
    }));
  }

  async start(port = 3000) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`AutoPromptr Automation Server running on port ${port}`);
      console.log(`WebSocket server running on port 3001`);
    });

    // Cleanup on exit
    process.on('SIGINT', async () => {
      console.log('Shutting down automation server...');
      
      // Close all browser sessions
      for (const [sessionId, session] of this.activeSessions) {
        try {
          await session.browser.close();
        } catch (error) {
          console.error(`Error closing session ${sessionId}:`, error);
        }
      }
      
      this.server.close();
      process.exit(0);
    });
  }
}

// Start the server
if (require.main === module) {
  const server = new AutomationServer();
  server.start();
}

module.exports = AutomationServer;