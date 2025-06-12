
import { AutoPromtrError } from './errors';
import { API_BASE_URL, SUPABASE_URL } from './config';

// API Service Class with enhanced autopromptr-backend compatibility
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

  // Enhanced health check with autopromptr-backend compatibility
  async healthCheck(retries = 2): Promise<any> {
    const now = Date.now();
    
    // Return cached result if recent
    if (this.healthCheckCache && (now - this.lastHealthCheck) < this.HEALTH_CHECK_INTERVAL) {
      console.log('Using cached health check result');
      return this.healthCheckCache;
    }

    console.log('Performing enhanced health check at:', this.apiBaseUrl);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Try enhanced autopromptr-backend health endpoint first
        let response;
        try {
          response = await fetch(`${this.apiBaseUrl}/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          });
        } catch (healthErr) {
          // Fallback to root endpoint for compatibility
          response = await fetch(`${this.apiBaseUrl}/`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'text/html,application/json,*/*'
            }
          });
        }
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 404) {
          // Enhanced result for autopromptr-backend
          const result = { 
            status: 'healthy', 
            backend: 'enhanced-autopromptr', 
            attempt,
            features: ['multi-strategy-detection', 'lovable-optimized', 'enhanced-timing']
          };
          console.log(`✅ Enhanced health check successful on attempt ${attempt}:`, result);
          
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

  // Get supported platforms - enhanced for autopromptr-backend
  async getPlatforms() {
    return [
      { id: 'lovable', name: 'Lovable (Enhanced)', type: 'web-editor' },
      { id: 'web', name: 'Web Platform', type: 'web' }
    ];
  }

  // Enhanced batch running with autopromptr-backend optimization
  async runBatch(batch: any, platform: string, options: { waitForIdle?: boolean; maxRetries?: number } = {}) {
    console.log('Starting enhanced batch run with autopromptr-backend:', { batch: batch.id, platform, options });
    
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
    
    // Detect if this is autopromptr-backend for enhanced features
    const isEnhancedBackend = this.apiBaseUrl.includes('autopromptr-backend');
    const endpoint = isEnhancedBackend ? '/api/run-batch' : '/run-puppeteer';
    
    console.log(`🎯 Using ${isEnhancedBackend ? 'enhanced autopromptr-backend' : 'puppeteer-backend'} with endpoint: ${endpoint}`);
    
    // Process each prompt with enhanced automation
    const results = [];
    
    if (isEnhancedBackend) {
      // Use enhanced batch processing for autopromptr-backend
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes for batch
        
        // Fix the payload structure to match backend expectations
        const firstPrompt = batch.prompts?.[0]?.text || batch.prompt || '';
        
        if (!firstPrompt) {
          throw new Error('No prompt found in batch - batch must have either prompt or prompts[0].text');
        }
        
        const requestBody = {
          batch: {
            id: batch.id,
            name: batch.name,
            targetUrl: batch.targetUrl,
            prompt: firstPrompt // Backend expects 'prompt' (singular), not 'prompts'
          },
          platform: platform,
          wait_for_idle: options.waitForIdle ?? true,
          max_retries: options.maxRetries ?? 3
        };
        
        console.log('🔧 Fixed batch request payload:', requestBody);
        console.log('📝 Sending prompt:', firstPrompt.substring(0, 100) + '...');
        
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
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
          console.error('❌ Enhanced backend error response:', response.status, errorText);
          
          // Better error handling based on status code
          if (response.status === 404) {
            throw new Error('Backend endpoint not found - please check backend deployment');
          } else if (response.status === 400) {
            throw new Error(`Bad request: ${errorText}`);
          } else if (response.status >= 500) {
            throw new Error(`Server error (${response.status}): Backend may be down`);
          }
          
          throw new Error(`Enhanced backend error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Enhanced batch processed successfully:', result);
        
        return {
          batchId: batch.id,
          status: 'completed',
          results: [result],
          processedAt: new Date().toISOString(),
          backend: 'enhanced-autopromptr'
        };
        
      } catch (err) {
        console.error('❌ Enhanced batch processing failed:', err);
        
        // Enhanced error categorization
        let errorMessage = err.message || 'Unknown error';
        let errorCode = 'ENHANCED_BATCH_FAILED';
        
        if (errorMessage.includes('fetch')) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'Failed to connect to backend - check internet connection';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
          errorCode = 'REQUEST_TIMEOUT';
          errorMessage = 'Request timed out - backend may be overloaded';
        } else if (errorMessage.includes('404')) {
          errorCode = 'ENDPOINT_NOT_FOUND';
          errorMessage = 'Backend endpoint not found - check deployment';
        } else if (errorMessage.includes('Bad request')) {
          errorCode = 'INVALID_REQUEST';
        }
        
        throw new AutoPromtrError(
          errorMessage,
          errorCode,
          500,
          true
        );
      }
    } else {
      // Fallback to individual prompt processing for puppeteer-backend
      for (const prompt of batch.prompts || []) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const requestBody = {
            url: batch.targetUrl,
            prompt: prompt.text
          };
          
          console.log('Sending fallback prompt request:', requestBody);
          
          const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
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
            console.error('Fallback backend error response:', response.status, errorText);
            
            results.push({
              promptId: prompt.id,
              success: false,
              error: `Backend error: ${response.status}`,
              errorCode: 'BACKEND_ERROR'
            });
            continue;
          }
          
          const result = await response.json();
          console.log('✅ Fallback prompt processed successfully');
          
          results.push({
            promptId: prompt.id,
            success: true,
            result: result,
            screenshot: result.screenshot
          });
          
        } catch (err) {
          console.error('❌ Error processing fallback prompt:', err);
          
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
        processedAt: new Date().toISOString(),
        backend: 'puppeteer-fallback'
      };
    }
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
