
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

// API Service Class with optimized health checks
export class AutoPromptr {
  private apiBaseUrl: string;
  private supabaseUrl: string;
  private maxRetries: number = 2; // Reduced retries
  private retryDelay: number = 2000; // Increased delay between retries
  private lastHealthCheck: number = 0;
  private healthCheckCache: any = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds minimum between health checks

  constructor(apiBaseUrl = API_BASE_URL, supabaseUrl = SUPABASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
    this.supabaseUrl = supabaseUrl;
  }

  // Simplified health check with caching to reduce requests
  async healthCheck(retries = 2): Promise<any> {
    const now = Date.now();
    
    // Return cached result if recent
    if (this.healthCheckCache && (now - this.lastHealthCheck) < this.HEALTH_CHECK_INTERVAL) {
      console.log('Using cached health check result');
      return this.healthCheckCache;
    }

    console.log('Performing new health check at:', this.apiBaseUrl);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Simple GET request to test connectivity - no complex POST with body
        const response = await fetch(`${this.apiBaseUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/json,*/*'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 404) {
          // Even 404 means the server is responding
          const result = { status: 'healthy', backend: 'puppeteer', attempt };
          console.log(`✅ Health check successful on attempt ${attempt}:`, result);
          
          // Cache the result
          this.healthCheckCache = result;
          this.lastHealthCheck = now;
          
          return result;
        } else {
          throw new AutoPromtrError(
            `Health check failed with status ${response.status}`,
            'HEALTH_CHECK_FAILED',
            response.status,
            attempt < retries
          );
        }
        
      } catch (err) {
        console.error(`❌ Health check attempt ${attempt} failed:`, err);
        
        if (attempt === retries) {
          if (err.name === 'AbortError') {
            throw new AutoPromtrError(
              'Health check timed out. The service may be experiencing high load.',
              'REQUEST_TIMEOUT',
              408,
              false
            );
          }
          
          if (err instanceof AutoPromtrError) {
            throw err;
          }
          
          throw new AutoPromtrError(
            'Backend service is not responding.',
            'SERVICE_UNAVAILABLE',
            503,
            false
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Get supported platforms - return array format for compatibility
  async getPlatforms() {
    return [
      { id: 'web', name: 'Web Platform', type: 'web' }
    ];
  }

  // Optimized batch running with better error handling
  async runBatch(batch: any, platform: string, options: { waitForIdle?: boolean; maxRetries?: number } = {}) {
    console.log('Starting optimized batch run:', { batch: batch.id, platform, options });
    
    // Skip redundant health check if we have a recent one
    const now = Date.now();
    if (!this.healthCheckCache || (now - this.lastHealthCheck) >= this.HEALTH_CHECK_INTERVAL) {
      try {
        await this.healthCheck();
      } catch (err) {
        console.error('❌ Health check failed, but continuing with batch run:', err);
        // Continue anyway - the actual request might still work
      }
    }
    
    // Process each prompt with optimized error handling
    const results = [];
    
    for (const prompt of batch.prompts || []) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // Reduced timeout
        
        const requestBody = {
          url: batch.targetUrl,
          prompt: prompt.text
        };
        
        console.log('Sending prompt request:', requestBody);
        
        const response = await fetch(`${this.apiBaseUrl}/api/run-puppeteer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', response.status, errorText);
          
          results.push({
            promptId: prompt.id,
            success: false,
            error: `Backend error: ${response.status}`,
            errorCode: 'BACKEND_ERROR'
          });
          continue;
        }
        
        const result = await response.json();
        console.log('✅ Prompt processed successfully');
        
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
          error: err instanceof Error ? err.message : 'Network error',
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

  // Simplified batch control methods
  async stopBatch(batchId: string) {
    return {
      batchId,
      status: 'stopped',
      message: 'Batch processing stopped'
    };
  }

  async getBatchStatus(batchId: string) {
    return {
      batchId,
      status: 'completed',
      message: 'Status check completed'
    };
  }

  async getBatchResults(batchId: string) {
    return {
      batchId,
      results: [],
      message: 'Results retrieved'
    };
  }
}

// Optimized React Hook with reduced polling
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
      console.log('Running batch with optimized backend:', batch.id);
      const result = await autoPromptr.runBatch(batch, platform, options);
      console.log('✅ Batch completed successfully');
      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof AutoPromtrError ? err.message : 'Unknown error';
      console.error('Batch run error:', errorMessage);
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
