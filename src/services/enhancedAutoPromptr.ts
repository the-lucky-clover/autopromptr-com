
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { TextAutomation } from './automation/textAutomation';
import { Batch } from '@/types/batch';

// Enhanced AutoPromptr service with intelligent backend communication
export class EnhancedAutoPromptr extends AutoPromptr {
  private enhancedRetryAttempts = 5;
  private enhancedRetryDelay = 2000;

  // Enhanced batch running with intelligent cold start detection
  async runBatchWithEnhancements(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with intelligent backend handling...');
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.max(options.maxRetries ?? 3, 3),
      automationDelay: options.automationDelay ?? 3000,
      elementTimeout: options.elementTimeout ?? 15000,
      debugLevel: options.debugLevel ?? 'detailed',
      ...options
    };
    
    console.log('🔧 Enhanced options with intelligent handling:', enhancedOptions);
    
    try {
      // Use the parent class method with enhanced error categorization
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch run completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch run failed:', err);
      
      // Enhanced error categorization with better context
      if (err instanceof AutoPromtrError) {
        // Provide more helpful error messages
        if (err.code === 'BACKEND_COLD_START') {
          throw new AutoPromtrError(
            'Backend service is starting up. This usually takes 30-60 seconds. Please wait and try again.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'BACKEND_TEMPORARILY_BUSY') {
          throw new AutoPromtrError(
            'Backend is temporarily busy processing other requests. Please wait a moment and try again.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'GATEWAY_ERROR') {
          throw new AutoPromtrError(
            'Gateway timeout occurred. The backend may be under load. Please try again.',
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
