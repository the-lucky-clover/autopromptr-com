
import { useState, useEffect } from 'react';

// Configuration - Use Supabase Edge Function for batch-exists endpoint
const API_BASE_URL = 'https://autopromptr-backend.onrender.com';
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

  // Enhanced health check with better cold start detection
  async healthCheck(retries = 3): Promise<any> {
    console.log('Checking backend health at:', this.apiBaseUrl);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        // Increased timeout for slow responses
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${this.apiBaseUrl}/health`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // More specific error handling for different status codes
          if (response.status === 503) {
            throw new AutoPromtrError(
              `Backend is temporarily unavailable (${response.status})`,
              'SERVICE_TEMPORARILY_UNAVAILABLE',
              response.status,
              true
            );
          } else if (response.status >= 500) {
            throw new AutoPromtrError(
              `Backend server error (${response.status})`,
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
        return result;
        
      } catch (err) {
        console.error(`❌ Health check attempt ${attempt} failed:`, err);
        
        if (attempt === retries) {
          // Only throw cold start error if we get connection refused or timeout
          if (err.name === 'AbortError' || err.message.includes('fetch')) {
            // Check if this might be a genuine cold start vs network issue
            const isLikelyColdStart = err.message.includes('refused') || err.name === 'AbortError';
            
            if (isLikelyColdStart) {
              throw new AutoPromtrError(
                'Backend service appears to be starting up. Please wait 30-60 seconds and try again.',
                'BACKEND_COLD_START',
                503,
                true
              );
            } else {
              throw new AutoPromtrError(
                'Backend service is not responding. Please check your connection and try again.',
                'SERVICE_UNAVAILABLE',
                503,
                true
              );
            }
          }
          
          if (err instanceof AutoPromtrError) {
            throw err;
          }
          
          throw new AutoPromtrError(
            'Backend health check failed after multiple attempts',
            'SERVICE_UNAVAILABLE',
            503,
            true
          );
        }
        
        // Progressive backoff delay
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Get supported platforms
  async getPlatforms() {
    const response = await fetch(`${this.apiBaseUrl}/api/platforms`);
    if (!response.ok) {
      throw new AutoPromtrError(
        'Failed to fetch platforms',
        'PLATFORMS_FETCH_FAILED',
        response.status
      );
    }
    return response.json();
  }

  // Enhanced batch running with better error discrimination
  async runBatch(batch: any, platform: string, options: { waitForIdle?: boolean; maxRetries?: number } = {}) {
    console.log('Starting enhanced batch run process with intelligent error handling:', { batch, platform, options });
    console.log('Backend URL:', this.apiBaseUrl);
    
    // Step 1: Intelligent backend health check
    try {
      const healthResult = await this.healthCheck();
      console.log('✅ Backend health confirmed:', healthResult);
    } catch (err) {
      console.error('❌ Backend health check failed:', err);
      
      if (err instanceof AutoPromtrError) {
        // Only throw cold start error if we're confident it's actually starting
        if (err.code === 'BACKEND_COLD_START') {
          throw err;
        }
        
        // For other errors, provide more helpful messaging
        if (err.code === 'SERVICE_TEMPORARILY_UNAVAILABLE') {
          throw new AutoPromtrError(
            'Backend is experiencing high load. Please wait a moment and try again.',
            'BACKEND_BUSY',
            503,
            true
          );
        }
      }
      
      throw err;
    }
    
    // Step 2: Prepare payload with enhanced settings
    const payload = {
      batch: {
        id: batch.id,
        name: batch.name,
        targetUrl: batch.targetUrl,
        description: batch.description || '',
        platform: batch.platform || platform,
        settings: batch.settings,
        prompts: batch.prompts.map((prompt: any) => ({
          id: prompt.id,
          text: prompt.text,
          order: prompt.order
        }))
      },
      platform: platform,
      wait_for_idle: options.waitForIdle ?? true,
      max_retries: options.maxRetries ?? 0
    };
    
    console.log('Sending payload with intelligent error handling:', payload);
    
    try {
      const controller = new AbortController();
      // Longer timeout for batch operations
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      const response = await fetch(`${this.apiBaseUrl}/api/run-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Batch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        
        let errorMessage = 'Failed to start batch';
        let errorCode = 'BATCH_START_FAILED';
        let retryable = false;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
          errorCode = errorJson.code || errorCode;
          retryable = errorJson.retryable || false;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        // Enhanced error handling for specific cases
        if (response.status === 503) {
          errorCode = 'BACKEND_TEMPORARILY_BUSY';
          errorMessage = 'Backend is temporarily busy processing other requests. Please try again in a moment.';
          retryable = true;
        } else if (response.status === 502 || response.status === 504) {
          errorCode = 'GATEWAY_ERROR';
          errorMessage = 'Gateway timeout - the backend may be under heavy load. Please try again.';
          retryable = true;
        }
        
        throw new AutoPromtrError(errorMessage, errorCode, response.status, retryable);
      }
      
      const result = await response.json();
      console.log('✅ Batch run successful with intelligent error handling:', result);
      return result;
      
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      // Handle network errors with better context
      if (err.name === 'AbortError') {
        throw new AutoPromtrError(
          'Request timed out. The backend may be processing a heavy workload.',
          'REQUEST_TIMEOUT',
          408,
          true
        );
      }
      
      throw new AutoPromtrError(
        `Network error: ${err.message}`,
        'NETWORK_ERROR',
        0,
        true
      );
    }
  }

  // Stop batch processing with enhanced error handling
  async stopBatch(batchId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${this.apiBaseUrl}/api/stop-batch/${batchId}`, {
        method: 'POST',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to stop batch',
          'BATCH_STOP_FAILED',
          response.status
        );
      }
      
      return response.json();
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      throw new AutoPromtrError(
        `Failed to stop batch: ${err.message}`,
        'BATCH_STOP_ERROR',
        0
      );
    }
  }

  // Get batch status and progress with enhanced timeout
  async getBatchStatus(batchId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(`${this.apiBaseUrl}/api/batch-status/${batchId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to get batch status',
          'STATUS_FETCH_FAILED',
          response.status
        );
      }
      
      return response.json();
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      throw new AutoPromtrError(
        `Failed to get batch status: ${err.message}`,
        'STATUS_FETCH_ERROR',
        0
      );
    }
  }

  // Get detailed batch results with timeout
  async getBatchResults(batchId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(`${this.apiBaseUrl}/api/batch-results/${batchId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to get batch results',
          'RESULTS_FETCH_FAILED',
          response.status
        );
      }
      
      return response.json();
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      throw new AutoPromtrError(
        `Failed to get batch results: ${err.message}`,
        'RESULTS_FETCH_ERROR',
        0
      );
    }
  }
}

// Enhanced React Hook for batch automation
export function useBatchAutomation(batchId?: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPromptr] = useState(new AutoPromptr());

  // Poll for status updates with enhanced error handling
  useEffect(() => {
    if (!batchId) return;

    const pollStatus = async () => {
      try {
        const statusData = await autoPromptr.getBatchStatus(batchId);
        setStatus(statusData);
        setError(null); // Clear any previous errors
        
        // Stop polling if batch is completed or failed
        if (['completed', 'failed', 'stopped'].includes(statusData.status)) {
          return;
        }
        
        // Continue polling every 5 seconds
        setTimeout(pollStatus, 5000);
      } catch (err) {
        console.error('Status polling error:', err);
        const errorMessage = err instanceof AutoPromtrError ? err.message : 'Unknown polling error';
        setError(errorMessage);
        
        // Continue polling even on error (might be temporary)
        setTimeout(pollStatus, 10000); // Wait longer on error
      }
    };

    pollStatus();
  }, [batchId, autoPromptr]);

  const runBatch = async (batch: any, platform: string, options?: { delay?: number; maxRetries?: number }) => {
    if (!batch || !batch.id) throw new AutoPromtrError('No batch provided', 'NO_BATCH_PROVIDED');
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running batch with intelligent error handling:', batch, 'on platform:', platform);
      const result = await autoPromptr.runBatch(batch, platform, options);
      console.log('✅ Enhanced batch run result:', result);
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
