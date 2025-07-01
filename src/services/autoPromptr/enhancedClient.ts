import { AutoPromtrError } from './errors';
import { Batch } from '@/types/batch';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class EnhancedAutoPromtrClient {
  private baseUrl: string;
  private retryConfig: RetryConfig;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || localStorage.getItem('backendUrl') || 'https://autopromptr-backend.onrender.com';
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log(`🔄 Making request to ${url} (attempt ${retryCount + 1})`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw AutoPromtrError.fromBackendError({
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
          ...errorData
        });
      }

      const data = await response.json();
      console.log(`✅ Request successful to ${url}`);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ Request failed to ${url}:`, error);
      
      if (error instanceof AutoPromtrError) {
        // If it's a non-retryable error or we've exhausted retries
        if (!error.retryable || retryCount >= this.retryConfig.maxRetries) {
          throw error;
        }
        
        // Retry with exponential backoff
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await this.delay(delay);
        
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new AutoPromtrError(
          'Network connection failed',
          'NETWORK_ERROR',
          0,
          true,
          'Cannot connect to the automation backend. Please check your internet connection.',
          error.message
        );
        
        if (retryCount < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`⏳ Network error, retrying in ${delay}ms...`);
          await this.delay(delay);
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
        
        throw networkError;
      }
      
      throw AutoPromtrError.fromBackendError(error);
    }
  }

  async runBatch(batch: Batch, platform: string, settings?: any): Promise<any> {
    console.log('🚀 Enhanced batch execution starting...');
    
    try {
      // First, test backend connectivity
      await this.testConnection();
      
      const response = await this.makeRequest('/api/run-batch', {
        method: 'POST',
        body: JSON.stringify({
          batch,
          platform,
          settings: {
            ...settings,
            // Enhanced Chrome configuration for backend
            chromeArgs: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu'
            ],
            retryConfig: this.retryConfig
          }
        })
      });
      
      console.log('✅ Enhanced batch execution completed successfully');
      return response;
      
    } catch (error) {
      console.error('💥 Enhanced batch execution failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      
      // Handle both uppercase and lowercase status responses
      const status = response.status?.toLowerCase();
      if (status !== 'ok') {
        throw new AutoPromtrError(
          'Backend health check failed',
          'HEALTH_CHECK_FAILED',
          0,
          false,
          'Backend returned non-OK status'
        );
      }
      
      return true;
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      throw new AutoPromtrError(
        'Backend health check failed',
        'HEALTH_CHECK_FAILED',
        0,
        false,
        'Unable to connect to backend'
      );
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    return this.makeRequest(`/api/batch/${batchId}/status`);
  }

  async stopBatch(batchId: string): Promise<any> {
    return this.makeRequest(`/api/batch/${batchId}/stop`, {
      method: 'POST'
    });
  }
}
