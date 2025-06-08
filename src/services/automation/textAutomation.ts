
import { ElementDetector } from './elementDetection';
import { SubmissionHandler } from './submissionMethods';
import { PageReadinessChecker } from './pageReadiness';
import { AutoPromtrError } from '../autoPromptr';

// Text automation with enhanced reliability
export class TextAutomation {
  private static readonly DEFAULT_RETRY_ATTEMPTS = 5;
  private static readonly DEFAULT_RETRY_DELAY = 2000;

  static async automateTextEntryWithRetries(
    page: any, 
    text: string, 
    retryAttempts = this.DEFAULT_RETRY_ATTEMPTS,
    retryDelay = this.DEFAULT_RETRY_DELAY
  ): Promise<void> {
    console.log(`🚀 Starting enhanced text automation for: "${text.substring(0, 50)}..."`);
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`📝 Text entry attempt ${attempt}/${retryAttempts}`);
        
        // Wait for page readiness
        await PageReadinessChecker.waitForLovablePageReady(page);
        
        // Find chat input with enhanced strategies
        const chatInput = await ElementDetector.findChatInput(page);
        
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
        const submitted = await SubmissionHandler.tryMultipleSubmissions(page);
        
        if (submitted) {
          console.log('✅ Message submitted successfully');
          return; // Success!
        }
        
        throw new Error('Failed to submit message');
        
      } catch (err) {
        console.error(`❌ Attempt ${attempt} failed:`, err.message);
        
        if (attempt === retryAttempts) {
          throw new AutoPromtrError(
            `Text automation failed after ${retryAttempts} attempts: ${err.message}`,
            'TEXT_AUTOMATION_FAILED',
            500,
            true
          );
        }
        
        // Progressive backoff delay
        const delay = retryDelay * Math.pow(1.5, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await page.waitForTimeout(delay);
      }
    }
  }
}
