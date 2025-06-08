
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { Batch } from '@/types/batch';

// Enhanced AutoPromptr service with improved backend communication
export class EnhancedAutoPromptr extends AutoPromptr {
  private enhancedRetryAttempts = 5;
  private enhancedRetryDelay = 2000;

  // Enhanced element detection strategies for Lovable
  private async findChatInputWithStrategies(page: any): Promise<any> {
    const strategies = [
      {
        name: 'Direct Lovable Selectors',
        selectors: [
          'textarea[placeholder*="Message"]',
          'textarea[placeholder*="Chat"]',
          'textarea[placeholder*="Ask"]',
          'div[contenteditable="true"]',
          '.chat-input textarea',
          '[data-testid="chat-input"]',
          '[aria-label*="chat"]',
          '[aria-label*="message"]'
        ]
      },
      {
        name: 'Visible Input Detection',
        selectors: [
          'textarea:visible',
          'input[type="text"]:visible',
          'div[contenteditable="true"]:visible'
        ]
      },
      {
        name: 'Focus-based Detection',
        selectors: [
          'textarea:focus',
          'input:focus',
          '[contenteditable="true"]:focus'
        ]
      }
    ];

    for (const strategy of strategies) {
      console.log(`Trying strategy: ${strategy.name}`);
      
      for (const selector of strategy.selectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`✅ Found chat input with selector: ${selector}`);
            return element;
          }
        } catch (err) {
          console.log(`❌ Selector failed: ${selector}`, err.message);
        }
      }
    }

    throw new AutoPromtrError(
      'No chat input found after trying all strategies',
      'CHAT_INPUT_NOT_FOUND',
      404,
      true
    );
  }

  // Enhanced page waiting with Lovable-specific optimizations
  private async waitForLovablePageReady(page: any): Promise<void> {
    console.log('🔄 Waiting for Lovable page to be ready...');
    
    try {
      // Wait for basic page load
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('✅ Network idle achieved');
      
      // Wait for Lovable-specific elements
      await page.waitForSelector('body', { timeout: 30000 });
      console.log('✅ Body element loaded');
      
      // Additional wait for dynamic content
      await page.waitForTimeout(3000);
      console.log('✅ Dynamic content wait completed');
      
      // Check if Lovable editor is loaded
      const isEditorLoaded = await page.evaluate(() => {
        return document.querySelector('.lovable-editor, .editor-container, [data-testid="editor"]') !== null;
      });
      
      if (isEditorLoaded) {
        console.log('✅ Lovable editor detected');
        await page.waitForTimeout(2000); // Extra wait for editor initialization
      }
      
    } catch (err) {
      console.warn('⚠️ Page readiness check failed:', err.message);
      // Continue anyway with a basic wait
      await page.waitForTimeout(5000);
    }
  }

  // Enhanced text automation with multiple submission strategies
  private async automateTextEntryWithRetries(page: any, text: string): Promise<void> {
    console.log(`🚀 Starting enhanced text automation for: "${text.substring(0, 50)}..."`);
    
    for (let attempt = 1; attempt <= this.enhancedRetryAttempts; attempt++) {
      try {
        console.log(`📝 Text entry attempt ${attempt}/${this.enhancedRetryAttempts}`);
        
        // Wait for page readiness
        await this.waitForLovablePageReady(page);
        
        // Find chat input with enhanced strategies
        const chatInput = await this.findChatInputWithStrategies(page);
        
        // Focus and prepare input
        await chatInput.focus();
        await page.waitForTimeout(500);
        
        // Clear existing content
        await chatInput.fill('');
        await page.waitForTimeout(300);
        
        // Type the text with human-like timing
        await chatInput.type(text, { delay: 75 });
        console.log('✅ Text typed successfully');
        
        // Wait a moment for the text to register
        await page.waitForTimeout(1000);
        
        // Try multiple submission strategies
        const submitted = await this.tryMultipleSubmissionMethods(page);
        
        if (submitted) {
          console.log('✅ Message submitted successfully');
          return; // Success!
        }
        
        throw new Error('Failed to submit message');
        
      } catch (err) {
        console.error(`❌ Attempt ${attempt} failed:`, err.message);
        
        if (attempt === this.enhancedRetryAttempts) {
          throw new AutoPromtrError(
            `Text automation failed after ${this.enhancedRetryAttempts} attempts: ${err.message}`,
            'TEXT_AUTOMATION_FAILED',
            500,
            true
          );
        }
        
        // Progressive backoff delay
        const delay = this.enhancedRetryDelay * Math.pow(1.5, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await page.waitForTimeout(delay);
      }
    }
  }

  // Multiple submission method attempts
  private async tryMultipleSubmissionMethods(page: any): Promise<boolean> {
    const submissionMethods = [
      {
        name: 'Enter Key',
        action: async () => await page.keyboard.press('Enter')
      },
      {
        name: 'Submit Button Click',
        action: async () => {
          const submitBtn = await page.$('button[type="submit"], .submit-btn, [aria-label*="send"]');
          if (submitBtn) await submitBtn.click();
          else throw new Error('Submit button not found');
        }
      },
      {
        name: 'Send Icon Click',
        action: async () => {
          const sendIcon = await page.$('[data-testid="send"], .send-icon, svg[aria-label*="send"]');
          if (sendIcon) await sendIcon.click();
          else throw new Error('Send icon not found');
        }
      },
      {
        name: 'Ctrl+Enter Combination',
        action: async () => await page.keyboard.press('Control+Enter')
      }
    ];

    for (const method of submissionMethods) {
      try {
        console.log(`🔄 Trying submission method: ${method.name}`);
        await method.action();
        
        // Wait to see if submission was successful
        await page.waitForTimeout(2000);
        
        // Check if message was sent (input should be cleared or new message appears)
        const isCleared = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('textarea, input, [contenteditable="true"]'));
          return inputs.some(input => (input as HTMLInputElement).value === '' || input.textContent === '');
        });
        
        if (isCleared) {
          console.log(`✅ Submission successful with: ${method.name}`);
          return true;
        }
        
      } catch (err) {
        console.log(`❌ ${method.name} failed:`, err.message);
      }
    }
    
    return false;
  }

  // Enhanced batch running with improved error handling
  async runBatchWithEnhancements(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with improved automation...');
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.max(options.maxRetries ?? 3, 3),
      automationDelay: options.automationDelay ?? 3000,
      elementTimeout: options.elementTimeout ?? 15000,
      debugLevel: options.debugLevel ?? 'detailed',
      ...options
    };
    
    console.log('🔧 Enhanced options:', enhancedOptions);
    
    try {
      // Use the parent class method but with enhanced error handling
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch run completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch run failed:', err);
      
      // Enhanced error categorization and handling
      if (err instanceof AutoPromtrError) {
        // Add enhanced context to existing errors
        throw new AutoPromtrError(
          `Enhanced automation failed: ${err.message}`,
          err.code,
          err.statusCode,
          true // Make retryable for enhanced handling
        );
      }
      
      throw new AutoPromtrError(
        `Enhanced batch execution failed: ${err.message}`,
        'ENHANCED_BATCH_FAILED',
        500,
        true
      );
    }
  }

  // Enhanced status polling with better authentication
  async getBatchStatusWithAuth(batchId: string, apiKey?: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add API key if provided
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-Key'] = apiKey;
      }
      
      // Access the parent's apiBaseUrl through type assertion since it's private
      const baseUrl = (this as any).apiBaseUrl || 'https://autopromptr-backend.onrender.com';
      
      const response = await fetch(`${baseUrl}/api/batch-status/${batchId}`, {
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Enhanced error handling for authentication issues
        if (response.status === 401 || response.status === 403) {
          throw new AutoPromtrError(
            'Authentication failed. Please check your API configuration.',
            'AUTH_FAILED',
            response.status,
            false
          );
        }
        
        throw new AutoPromtrError(
          `Status fetch failed with status ${response.status}`,
          'STATUS_FETCH_FAILED',
          response.status,
          true
        );
      }
      
      return response.json();
      
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      throw new AutoPromtrError(
        `Enhanced status fetch failed: ${err.message}`,
        'ENHANCED_STATUS_ERROR',
        0,
        true
      );
    }
  }
}
