
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { TextAutomation } from './automation/textAutomation';
import { Batch } from '@/types/batch';

// Enhanced AutoPromptr service with intelligent backend communication
export class EnhancedAutoPromptr extends AutoPromptr {
  private enhancedRetryAttempts = 5;
  private enhancedRetryDelay = 2000;

  // Enhanced batch running with better error handling
  async runBatchWithEnhancements(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with improved error handling...');
    
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
      // Use the parent class method with improved error handling
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch run completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch run failed:', err);
      
      // Enhanced error categorization with clearer messages
      if (err instanceof AutoPromtrError) {
        // Provide more specific error messages based on error codes
        if (err.code === 'NETWORK_CONNECTION_FAILED') {
          throw new AutoPromtrError(
            'Cannot connect to the automation backend. Please check your internet connection and try again.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'REQUEST_TIMEOUT') {
          throw new AutoPromtrError(
            'Backend request timed out. The service may be under heavy load. Please wait a moment and try again.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'SERVICE_TEMPORARILY_UNAVAILABLE') {
          throw new AutoPromtrError(
            'Backend service is temporarily unavailable. Please wait a few minutes and try again.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        // Pass through other errors with enhanced context
        throw new AutoPromtrError(
          `Enhanced automation failed: ${err.message}`,
          err.code,
          err.statusCode,
          err.retryable
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

  // Enhanced status polling with intelligent retry logic
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
        
        if (response.status === 503) {
          throw new AutoPromtrError(
            'Backend is temporarily unavailable. Please try again in a moment.',
            'STATUS_SERVICE_UNAVAILABLE',
            response.status,
            true
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
