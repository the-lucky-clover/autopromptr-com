import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface PlaywrightConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  timeout?: number;
}

export interface AutomationResult {
  success: boolean;
  message?: string;
  error?: string;
  screenshot?: string;
  data?: any;
}

export class PlaywrightAutomationService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async initialize(config: PlaywrightConfig = {}): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: config.headless ?? true,
      });

      this.context = await this.browser.newContext({
        viewport: config.viewport || { width: 1920, height: 1080 },
        userAgent: config.userAgent || 'AutoPromptr Bot v1.0'
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(config.timeout || 30000);

      console.log('🎭 Playwright automation service initialized');
    } catch (error) {
      console.error('Failed to initialize Playwright:', error);
      throw error;
    }
  }

  async navigateToTarget(url: string): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: 'Playwright not initialized' };
    }

    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      
      return {
        success: true,
        message: `Successfully navigated to ${url}`,
        data: { url, title: await this.page.title() }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to navigate to ${url}: ${error}`
      };
    }
  }

  async detectTextInputFields(): Promise<string[]> {
    if (!this.page) return [];

    try {
      // Enhanced text input detection with multiple selectors
      const inputSelectors = [
        'input[type="text"]',
        'input[type="search"]',
        'textarea',
        '[contenteditable="true"]',
        '[role="textbox"]',
        '.monaco-editor', // VS Code editor
        '.CodeMirror', // CodeMirror editor
        '[data-testid*="input"]',
        '[placeholder*="prompt"]',
        '[placeholder*="message"]',
        '[placeholder*="text"]'
      ];

      const inputs = await this.page.$$eval(
        inputSelectors.join(','),
        (elements) => elements.map((el, index) => ({
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          placeholder: el.getAttribute('placeholder') || '',
          id: el.id || '',
          className: el.className || '',
          visible: (el as HTMLElement).offsetParent !== null
        }))
      );

      return inputs
        .filter(input => input.visible)
        .map(input => input.selector);
    } catch (error) {
      console.error('Error detecting text inputs:', error);
      return [];
    }
  }

  async injectPrompt(selector: string, prompt: string): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: 'Playwright not initialized' };
    }

    try {
      // Wait for element to be available
      await this.page.waitForSelector(selector, { timeout: 10000 });
      
      // Clear existing content
      await this.page.click(selector);
      await this.page.keyboard.press('Control+A');
      
      // Type the prompt with human-like timing
      await this.page.type(selector, prompt, { delay: 50 });
      
      // Take screenshot for verification
      const screenshot = await this.page.screenshot({ 
        type: 'png',
        fullPage: false 
      });

      return {
        success: true,
        message: `Successfully injected prompt into ${selector}`,
        screenshot: screenshot.toString('base64'),
        data: { selector, promptLength: prompt.length }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to inject prompt: ${error}`
      };
    }
  }

  async submitForm(submitSelector?: string): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: 'Playwright not initialized' };
    }

    try {
      let submitButton;

      if (submitSelector) {
        submitButton = await this.page.$(submitSelector);
      } else {
        // Try to find common submit patterns
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:has-text("Send")',
          'button:has-text("Submit")',
          'button:has-text("Generate")',
          '[data-testid*="submit"]',
          '[data-testid*="send"]'
        ];

        for (const selector of submitSelectors) {
          submitButton = await this.page.$(selector);
          if (submitButton) break;
        }
      }

      if (!submitButton) {
        // Try pressing Enter as fallback
        await this.page.keyboard.press('Enter');
        return {
          success: true,
          message: 'Submitted using Enter key (no submit button found)'
        };
      }

      await submitButton.click();
      
      // Wait for response/navigation
      await this.page.waitForTimeout(2000);

      return {
        success: true,
        message: 'Successfully submitted form'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to submit form: ${error}`
      };
    }
  }

  async waitForResponse(timeout: number = 30000): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: 'Playwright not initialized' };
    }

    try {
      // Wait for network activity to settle
      await this.page.waitForLoadState('networkidle', { timeout });
      
      // Check for common response indicators
      const responseIndicators = [
        '[data-testid*="response"]',
        '[class*="response"]',
        '[class*="output"]',
        '[class*="result"]'
      ];

      let responseFound = false;
      for (const selector of responseIndicators) {
        const element = await this.page.$(selector);
        if (element) {
          responseFound = true;
          break;
        }
      }

      return {
        success: true,
        message: responseFound ? 'Response detected' : 'Submission completed',
        data: { responseDetected: responseFound }
      };
    } catch (error) {
      return {
        success: false,
        error: `Timeout waiting for response: ${error}`
      };
    }
  }

  async takeScreenshot(fullPage: boolean = false): Promise<string> {
    if (!this.page) return '';

    try {
      const screenshot = await this.page.screenshot({
        type: 'png',
        fullPage
      });
      return screenshot.toString('base64');
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return '';
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
      
      this.page = null;
      this.context = null;
      this.browser = null;
      
      console.log('🎭 Playwright automation service cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Combined automation workflow
  async automatePromptSubmission(
    url: string,
    prompt: string,
    options: {
      inputSelector?: string;
      submitSelector?: string;
      waitForResponse?: boolean;
      takeScreenshot?: boolean;
    } = {}
  ): Promise<AutomationResult> {
    try {
      // Navigate to target
      const navResult = await this.navigateToTarget(url);
      if (!navResult.success) return navResult;

      // Detect or use provided input selector
      let inputSelector = options.inputSelector;
      if (!inputSelector) {
        const inputs = await this.detectTextInputFields();
        if (inputs.length === 0) {
          return { success: false, error: 'No text input fields found' };
        }
        inputSelector = inputs[0]; // Use first available input
      }

      // Inject prompt
      const injectResult = await this.injectPrompt(inputSelector, prompt);
      if (!injectResult.success) return injectResult;

      // Submit form
      const submitResult = await this.submitForm(options.submitSelector);
      if (!submitResult.success) return submitResult;

      // Wait for response if requested
      if (options.waitForResponse) {
        const responseResult = await this.waitForResponse();
        if (!responseResult.success) return responseResult;
      }

      // Take final screenshot if requested
      let screenshot = '';
      if (options.takeScreenshot) {
        screenshot = await this.takeScreenshot(true);
      }

      return {
        success: true,
        message: 'Automation completed successfully',
        screenshot,
        data: {
          url,
          promptLength: prompt.length,
          inputSelector,
          completed: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Automation failed: ${error}`
      };
    }
  }
}

// Singleton instance
export const playwrightService = new PlaywrightAutomationService();