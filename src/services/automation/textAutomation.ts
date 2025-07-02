
import { Batch } from '@/types/batch';
import { AutoPromptr } from '../autoPromptr';
import { AutoPromptrError } from '../autoPromptr';

export class TextAutomationService {
  private autoPromptr: AutoPromptr;

  constructor(baseUrl?: string) {
    this.autoPromptr = new AutoPromptr(baseUrl);
  }

  async processTextBatch(batch: Batch, options?: {
    maxRetries?: number;
    timeout?: number;
    concurrency?: number;
  }): Promise<any> {
    try {
      console.log('🔤 Starting text automation processing...');
      
      // Validate batch for text processing
      if (!batch.prompts || batch.prompts.length === 0) {
        throw new AutoPromptrError(
          'No prompts provided for text automation',
          'INVALID_BATCH',
          400,
          false
        );
      }

      // Process with enhanced text handling
      const result = await this.autoPromptr.runBatch(batch, 'text-automation', {
        waitForIdle: false, // Text doesn't need DOM waiting
        maxRetries: options?.maxRetries || 2,
        timeout: options?.timeout || 15000,
        ...options
      });

      console.log('✅ Text automation completed successfully');
      return result;

    } catch (error) {
      console.error('💥 Text automation failed:', error);
      
      if (error instanceof AutoPromptrError) {
        throw error;
      }
      
      throw new AutoPromptrError(
        'Text automation processing failed',
        'TEXT_AUTOMATION_ERROR',
        500,
        true
      );
    }
  }

  async optimizePromptText(text: string): Promise<string> {
    // Simple text optimization logic
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }
}
