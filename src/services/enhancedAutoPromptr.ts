
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { TextAutomation } from './automation/textAutomation';
import { Batch } from '@/types/batch';

// Enhanced AutoPromptr service with improved backend communication
export class EnhancedAutoPromptr extends AutoPromptr {
  private enhancedRetryAttempts = 5;
  private enhancedRetryDelay = 2000;

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

  // Enhanced text automation method
  async automateTextEntry(page: any, text: string): Promise<void> {
    return TextAutomation.automateTextEntryWithRetries(
      page, 
      text, 
      this.enhancedRetryAttempts, 
      this.enhancedRetryDelay
    );
  }
}
