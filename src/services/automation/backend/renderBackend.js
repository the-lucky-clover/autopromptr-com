// This file should be deployed to Render.com as a separate service
// It provides the actual browser automation backend for the frontend

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main automation endpoint
app.post('/api/automate', async (req, res) => {
  const { targetUrl, promptText, waitForIdle = true, maxRetries = 3, timeout = 30000 } = req.body;

  console.log('🤖 Starting automation:', { targetUrl, promptText: promptText.substring(0, 100) });

  let browser = null;
  let page = null;

  try {
    // Launch browser with specific settings for Render
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to target URL
    console.log('🌐 Navigating to:', targetUrl);
    await page.goto(targetUrl, { 
      waitUntil: waitForIdle ? 'networkidle0' : 'domcontentloaded',
      timeout: timeout 
    });

    // Wait for page to be ready
    await page.waitForTimeout(3000);

    // Try multiple strategies to find text input
    const inputSelectors = [
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="Chat"]', 
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="Type"]',
      'div[contenteditable="true"]',
      'textarea:not([disabled]):not([readonly])',
      'input[type="text"]:not([disabled]):not([readonly])',
      '.chat-input textarea',
      '[data-testid="chat-input"]',
      '[aria-label*="chat"]',
      '[aria-label*="message"]'
    ];

    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        inputElement = await page.$(selector);
        if (inputElement) {
          const isVisible = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
          }, inputElement);
          
          if (isVisible) {
            console.log('✅ Found input element with selector:', selector);
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    if (!inputElement) {
      throw new Error('Could not find any text input element on the page');
    }

    // Focus and clear the input
    await inputElement.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Type the prompt text
    console.log('⌨️ Typing prompt text...');
    await inputElement.type(promptText, { delay: 50 });

    // Wait a moment before submitting
    await page.waitForTimeout(1000);

    // Try different submission methods
    const submissionMethods = [
      // Method 1: Enter key
      async () => {
        await page.keyboard.press('Enter');
        console.log('📤 Submitted using Enter key');
      },
      // Method 2: Submit button
      async () => {
        const submitBtn = await page.$('button[type="submit"], .submit-btn, [aria-label*="send"]');
        if (submitBtn) {
          await submitBtn.click();
          console.log('📤 Submitted using submit button');
        } else {
          throw new Error('Submit button not found');
        }
      },
      // Method 3: Send icon
      async () => {
        const sendIcon = await page.$('[data-testid="send"], .send-icon, svg[aria-label*="send"]');
        if (sendIcon) {
          await sendIcon.click();
          console.log('📤 Submitted using send icon');
        } else {
          throw new Error('Send icon not found');
        }
      }
    ];

    let submitted = false;
    for (const method of submissionMethods) {
      try {
        await method();
        submitted = true;
        break;
      } catch (err) {
        console.log('⚠️ Submission method failed:', err.message);
        continue;
      }
    }

    if (!submitted) {
      throw new Error('All submission methods failed');
    }

    // Wait for response
    await page.waitForTimeout(3000);

    // Take screenshot for verification
    const screenshot = await page.screenshot({ 
      encoding: 'base64',
      fullPage: false
    });

    console.log('✅ Automation completed successfully');

    res.json({
      success: true,
      message: 'Prompt submitted successfully',
      targetUrl,
      promptText: promptText.substring(0, 100) + (promptText.length > 100 ? '...' : ''),
      screenshot: `data:image/png;base64,${screenshot}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Automation failed:', error);
    
    // Try to take screenshot even on failure
    let errorScreenshot = null;
    try {
      if (page) {
        errorScreenshot = await page.screenshot({ encoding: 'base64' });
      }
    } catch (screenshotErr) {
      console.error('Failed to take error screenshot:', screenshotErr);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      targetUrl,
      screenshot: errorScreenshot ? `data:image/png;base64,${errorScreenshot}` : null,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Clean up
    try {
      if (page) await page.close();
      if (browser) await browser.close();
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
  }
});

// Test connection endpoint
app.post('/api/test-connection', async (req, res) => {
  const { targetUrl } = req.body;
  
  let browser = null;
  let page = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    res.json({ 
      success: true, 
      message: 'Connection test successful',
      targetUrl 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      targetUrl 
    });
  } finally {
    try {
      if (page) await page.close();
      if (browser) await browser.close();
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AutoPromptr Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;