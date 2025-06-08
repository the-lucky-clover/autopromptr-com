
import { useState, useEffect } from 'react';

// Configuration - Use your working Puppeteer backend
const API_BASE_URL = 'https://puppeteer-backend-da0o.onrender.com';
const SUPABASE_URL = 'https://raahpoyciwuyhwlcenpy.supabase.co';

// Enhanced error handling with specific error types
export class AutoPromtrError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AutoPromtrError';
  }
}

// API Service Class with enhanced reliability
export class AutoPromptr {
  private apiBaseUrl: string;
  private supabaseUrl: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(apiBaseUrl = API_BASE_URL, supabaseUrl = SUPABASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
    this.supabaseUrl = supabaseUrl;
  }

  // Enhanced health check with better error classification
  async healthCheck(retries = 3): Promise<any> {
    console.log('Checking backend health at:', this.apiBaseUrl);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        // Test the /api/run-puppeteer endpoint since that's what works
        const response = await fetch(`${this.apiBaseUrl}/api/run-puppeteer`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: 'https://example.com',
            prompt: 'health check test'
          })
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 503) {
            throw new AutoPromtrError(
              `Backend is temporarily unavailable (${response.status}). The service may be restarting.`,
              'SERVICE_TEMPORARILY_UNAVAILABLE',
              response.status,
              true
            );
          } else if (response.status >= 500) {
            throw new AutoPromtrError(
              `Backend server error (${response.status}). Please try again.`,
              'SERVER_ERROR',
              response.status,
              true
            );
          } else {
            throw new AutoPromtrError(
              `Health check failed with status ${response.status}`,
              'HEALTH_CHECK_FAILED',
              response.status,
              attempt < retries
            );
          }
        }
        
        const result = await response.json();
        console.log(`✅ Backend health check successful on attempt ${attempt}:`, result);
        return { status: 'healthy', backend: 'puppeteer' };
        
      } catch (err) {
        console.error(`❌ Health check attempt ${attempt} failed:`, err);
        
        if (attempt === retries) {
          if (err.name === 'AbortError') {
            throw new AutoPromtrError(
              'Backend request timed out. The service may be experiencing high load or network issues.',
              'REQUEST_TIMEOUT',
              408,
              true
            );
          }
          
          if (err.message === 'Load failed' || err.message.includes('fetch')) {
            throw new AutoPromtrError(
              'Unable to connect to backend service. Please check your internet connection and try again.',
              'NETWORK_CONNECTION_FAILED',
              0,
              true
            );
          }
          
          if (err instanceof AutoPromtrError) {
            throw err;
          }
          
          throw new AutoPromtrError(
            'Backend service is not responding. Please check your connection and try again.',
            'SERVICE_UNAVAILABLE',
            503,
            true
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Get supported platforms - simplified for Puppeteer backend
  async getPlatforms() {
    return {
      platforms: ['web'],
      default: 'web'
    };
  }

  // Enhanced batch running adapted for Puppeteer backend
  async runBatch(batch: any, platform: string, options: { waitForIdle?: boolean; maxRetries?: number } = {}) {
    console.log('Starting batch run process with Puppeteer backend:', { batch, platform, options });
    console.log('Backend URL:', this.apiBaseUrl);
    
    // Step 1: Health check
    try {
      const healthResult = await this.healthCheck();
      console.log('✅ Backend health confirmed:', healthResult);
    } catch (err) {
      console.error('❌ Backend health check failed:', err);
      throw err;
    }
    
    // Step 2: Process each prompt in the batch
    const results = [];
    
    for (const prompt of batch.prompts || []) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        
        const response = await fetch(`${this.apiBaseUrl}/api/run-puppeteer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: batch.targetUrl,
            prompt: prompt.text
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Prompt response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          
          let errorMessage = 'Failed to process prompt';
          let errorCode = 'PROMPT_PROCESSING_FAILED';
          let retryable = false;
          
          if (response.status === 503) {
            errorCode = 'BACKEND_TEMPORARILY_BUSY';
            errorMessage = 'Backend is temporarily busy processing other requests. Please try again in a moment.';
            retryable = true;
          } else if (response.status === 502 || response.status === 504) {
            errorCode = 'GATEWAY_ERROR';
            errorMessage = 'Gateway timeout - the backend may be under heavy load. Please try again.';
            retryable = true;
          }
          
          results.push({
            promptId: prompt.id,
            success: false,
            error: errorMessage,
            errorCode
          });
          
          continue;
        }
        
        const result = await response.json();
        console.log('✅ Prompt processed successfully:', result);
        
        results.push({
          promptId: prompt.id,
          success: true,
          result: result,
          screenshot: result.screenshot
        });
        
      } catch (err) {
        console.error('❌ Error processing prompt:', err);
        
        results.push({
          promptId: prompt.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          errorCode: 'NETWORK_ERROR'
        });
      }
    }
    
    return {
      batchId: batch.id,
      status: 'completed',
      results: results,
      processedAt: new Date().toISOString()
    };
  }

  // Stop batch processing - simplified for Puppeteer backend
  async stopBatch(batchId: string) {
    console.log('Stop batch requested for:', batchId);
    return {
      batchId,
      status: 'stopped',
      message: 'Batch processing stopped'
    };
  }

  // Get batch status - simplified for Puppeteer backend
  async getBatchStatus(batchId: string) {
    return {
      batchId,
      status: 'completed',
      message: 'Status check completed'
    };
  }

  // Get detailed batch results - simplified for Puppeteer backend
  async getBatchResults(batchId: string) {
    return {
      batchId,
      results: [],
      message: 'Results retrieved'
    };
  }
}

// Enhanced React Hook for batch automation
export function useBatchAutomation(batchId?: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPromptr] = useState(new AutoPromptr());

  const runBatch = async (batch: any, platform: string, options?: { delay?: number; maxRetries?: number }) => {
    if (!batch || !batch.id) throw new AutoPromtrError('No batch provided', 'NO_BATCH_PROVIDED');
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running batch with Puppeteer backend:', batch, 'on platform:', platform);
      const result = await autoPromptr.runBatch(batch, platform, options);
      console.log('✅ Batch run result:', result);
      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof AutoPromtrError ? err.message : 'Unknown error';
      console.error('Run batch error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopBatch = async () => {
    if (!batchId) throw new AutoPromtrError('No batch ID provided', 'NO_BATCH_ID');
    
    try {
      await autoPromptr.stopBatch(batchId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof AutoPromtrError ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    runBatch,
    stopBatch,
    autoPromptr
  };
}
