import { Batch } from '@/types/batch';
import { AutoPromptrError } from '../autoPromptr/errors';

export interface BrowserAutomationOptions {
  maxRetries?: number;
  timeout?: number;
  waitForIdle?: boolean;
  debugLevel?: 'minimal' | 'standard' | 'detailed' | 'verbose';
}

export class BrowserAutomationService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use environment variable or fallback to render.com
    this.baseUrl = baseUrl || 'https://autopromptr-backend.onrender.com';
  }

  async processBatch(batch: Batch, options: BrowserAutomationOptions = {}): Promise<any> {
    try {
      console.log('🤖 [BrowserAutomation] Starting batch processing:', {
        batchId: batch.id,
        targetUrl: batch.targetUrl,
        promptCount: batch.prompts?.length || 0
      });

      // Validate batch data
      if (!batch.prompts || batch.prompts.length === 0) {
        throw new AutoPromptrError(
          'No prompts provided in batch',
          'INVALID_BATCH_DATA',
          400,
          false
        );
      }

      if (!batch.targetUrl) {
        throw new AutoPromptrError(
          'No target URL provided',
          'INVALID_TARGET_URL',
          400,
          false
        );
      }

      // Process prompts sequentially
      const results = [];
      for (let i = 0; i < batch.prompts.length; i++) {
        const prompt = batch.prompts[i];
        console.log(`📝 Processing prompt ${i + 1}/${batch.prompts.length}:`, prompt.text.substring(0, 100));

        try {
          const result = await this.processPrompt(batch.targetUrl, prompt.text, options);
          results.push({
            promptId: prompt.id,
            success: true,
            result,
            processedAt: new Date()
          });

          // Add delay between prompts to avoid overwhelming the target
          if (i < batch.prompts.length - 1) {
            await this.delay(2000); // 2 second delay between prompts
          }
        } catch (error) {
          console.error(`❌ Failed to process prompt ${i + 1}:`, error);
          results.push({
            promptId: prompt.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            processedAt: new Date()
          });
        }
      }

      console.log('✅ [BrowserAutomation] Batch processing completed:', {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return {
        batchId: batch.id,
        status: 'completed',
        results,
        completedAt: new Date()
      };

    } catch (error) {
      console.error('💥 [BrowserAutomation] Batch processing failed:', error);
      throw error instanceof AutoPromptrError ? error : new AutoPromptrError(
        'Browser automation failed',
        'AUTOMATION_ERROR',
        500,
        true
      );
    }
  }

  private async processPrompt(targetUrl: string, promptText: string, options: BrowserAutomationOptions): Promise<any> {
    const requestData = {
      targetUrl,
      promptText,
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 30000
    };

    console.log('🌐 Sending request to backend:', this.baseUrl + '/api/automate');

    const response = await fetch(`${this.baseUrl}/api/automate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AutoPromptrError(
        `Backend automation failed: ${response.status} - ${errorText}`,
        'BACKEND_ERROR',
        response.status,
        true
      );
    }

    const result = await response.json();
    console.log('✅ Backend response:', result);
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async testConnection(targetUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUrl })
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}