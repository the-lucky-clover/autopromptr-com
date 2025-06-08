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

  // Enhanced health check with timeout and retry
  async healthCheck(retries = 3): Promise<any> {
    console.log('Checking backend health at:', this.apiBaseUrl);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${this.apiBaseUrl}/health`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new AutoPromtrError(
            `Health check failed with status ${response.status}`,
            'HEALTH_CHECK_FAILED',
            response.status,
            true
          );
        }
        
        const result = await response.json();
        console.log(`Health check successful on attempt ${attempt}:`, result);
        return result;
      } catch (err) {
        console.error(`Health check attempt ${attempt} failed:`, err);
        
        if (attempt === retries) {
          if (err instanceof AutoPromtrError) {
            throw err;
          }
          throw new AutoPromtrError(
            'Backend service is not available after multiple attempts',
            'SERVICE_UNAVAILABLE',
            503,
            true
          );
        }
        
        // Wait before retrying (exponential backoff)
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

  // Enhanced batch running with idle detection instead of delays
  async runBatch(batch: any, platform: string, options: { waitForIdle?: boolean; maxRetries?: number } = {}) {
    console.log('Starting enhanced batch run process with idle detection:', { batch, platform, options });
    console.log('Backend URL:', this.apiBaseUrl);
    
    // Step 1: Ensure backend is healthy
    try {
      await this.healthCheck();
    } catch (err) {
      if (err instanceof AutoPromtrError && err.code === 'SERVICE_UNAVAILABLE') {
        throw new AutoPromtrError(
          'Backend service is starting up. Please wait 30-60 seconds and try again.',
          'BACKEND_COLD_START',
          503,
          true
        );
      }
      throw err;
    }
    
    // Step 2: Prepare payload with idle detection settings
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
    
    console.log('Sending enhanced payload with idle detection:', payload);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.apiBaseUrl}/api/run-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Enhanced response status:', response.status);
      
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
        
        // Handle specific error cases
        if (response.status === 503) {
          errorCode = 'BACKEND_OVERLOADED';
          errorMessage = 'Backend service is overloaded. Please try again in a few moments.';
          retryable = true;
        }
        
        throw new AutoPromtrError(errorMessage, errorCode, response.status, retryable);
      }
      
      const result = await response.json();
      console.log('Enhanced batch run successful with idle detection:', result);
      return result;
    } catch (err) {
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      // Handle network errors
      if (err.name === 'AbortError') {
        throw new AutoPromtrError(
          'Request timed out. The backend may be starting up.',
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
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
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

  // Get batch status and progress with timeout
  async getBatchStatus(batchId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      console.log('Running batch with complete batch data:', batch, 'on platform:', platform);
      const result = await autoPromptr.runBatch(batch, platform, options);
      console.log('Enhanced batch run result:', result);
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
