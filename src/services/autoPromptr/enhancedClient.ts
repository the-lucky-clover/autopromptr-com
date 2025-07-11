
import { AutoPromptrError } from './errors';
import { Batch } from '@/types/batch';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

// Backend API format - what the backend expects
interface BackendBatchRequest {
  batch: {
    id: string;
    // name: string;  // Removed because backend expects targetUrl, not name as URL
    targetUrl: string;
    prompt: string; // Single string, not array
    platform?: string;
    settings?: any;
  };
  platform: string;
  settings?: any;
}

export class EnhancedAutoPromptrClient {
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

  private transformBatchForBackend(batch: Batch): BackendBatchRequest['batch'] {
    let promptText = '';

    if (batch.prompts && batch.prompts.length > 0) {
      if (batch.prompts.length === 1) {
        promptText = batch.prompts[0].text || '';
      } else {
        promptText = batch.prompts
          .map((p, index) => `Prompt ${index + 1}: ${p.text}`)
          .join('\n\n---\n\n');
      }
    }

    return {
      id: batch.id,
      // Removed 'name' here to avoid confusion with targetUrl
      targetUrl: batch.targetUrl || '',  // Must be valid URL string
      prompt: promptText,
      platform: batch.platform,
      settings: batch.settings,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('🚀 [DIAGNOSTIC] Making request to backend:');
    console.log('📍 URL:', url);
    console.log('🔧 Method:', options.method || 'GET');
    console.log('📋 Headers:', options.headers);

    if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
      console.log('📦 Request Payload:');
      try {
        const parsedPayload = JSON.parse(options.body as string);
        console.log('  - Parsed payload:', parsedPayload);

        if (parsedPayload.batch) {
          console.log('  - Batch ID:', parsedPayload.batch.id);
          // Removed name log to avoid confusion
          console.log('  - Target URL:', parsedPayload.batch.targetUrl);
          console.log('  - Platform:', parsedPayload.platform);
          console.log('  - Prompt Length:', parsedPayload.batch.prompt?.length || 0);
          console.log('  - Settings:', parsedPayload.settings);
        }
      } catch (e) {
        console.log('  - Raw payload:', options.body);
        console.warn('  - Could not parse payload as JSON:', e);
      }
    }

    console.log(`🔄 Attempt ${retryCount + 1}/${this.retryConfig.maxRetries + 1}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 [DIAGNOSTIC] Response received:');
      console.log('  - Status:', response.status, response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
      console.log('  - URL:', response.url);
      console.log('  - OK:', response.ok);

      if (!response.ok) {
        let errorText = '';
        let errorData: any = {};

        try {
          errorText = await response.text();
          console.log('❌ [DIAGNOSTIC] Error response body:', errorText);

          try {
            errorData = JSON.parse(errorText);
            console.log('❌ [DIAGNOSTIC] Parsed error data:', errorData);
          } catch {
            errorData = { message: errorText };
            console.log('❌ [DIAGNOSTIC] Error response is not JSON, using as message');
          }
        } catch (readError) {
          console.error('❌ [DIAGNOSTIC] Could not read error response:', readError);
          errorData = { message: `HTTP ${response.status}` };
        }

        throw AutoPromptrError.fromBackendError({
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
          ...errorData
        });
      }

      let responseData;
      try {
        responseData = await response.json();
        console.log('✅ [DIAGNOSTIC] Successful response data:', responseData);
      } catch (parseError) {
        console.warn('⚠️ [DIAGNOSTIC] Could not parse response as JSON:', parseError);
        responseData = {};
      }

      console.log(`✅ Request successful to ${url}`);
      return responseData;

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ [DIAGNOSTIC] Request failed to ${url}:`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 [DIAGNOSTIC] Network error details:');
        console.error('  - Error type: Network/CORS failure');
        console.error('  - Message:', error.message);
        console.error('  - Likely causes: Backend down, CORS misconfiguration, network issues');
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ [DIAGNOSTIC] Request timeout details:');
        console.error('  - Request was aborted due to 30s timeout');
        console.error('  - Backend may be slow or unresponsive');
      }

      if (error instanceof AutoPromptrError) {
        console.error('🔧 [DIAGNOSTIC] AutoPromptrError details:');
        console.error('  - Code:', error.code);
        console.error('  - Retryable:', error.retryable);
        console.error('  - Status:', error.status);

        if (!error.retryable || retryCount >= this.retryConfig.maxRetries) {
          throw error;
        }

        const delay = this.calculateRetryDelay(retryCount);
        console.log(`⏳ [DIAGNOSTIC] Retrying in ${delay}ms...`);
        await this.delay(delay);

        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new AutoPromptrError(
          'Network connection failed',
          'NETWORK_ERROR',
          0,
          true,
          'Cannot connect to the automation backend. Please check your internet connection.',
          error.message
        );

        if (retryCount < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          console.log(`⏳ [DIAGNOSTIC] Network error, retrying in ${delay}ms...`);
          await this.delay(delay);
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        throw networkError;
      }

      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async runBatch(batch: Batch, platform: string, settings?: any): Promise<any> {
    console.log('🚀 [DIAGNOSTIC] Enhanced batch execution starting...');
    console.log('📋 [DIAGNOSTIC] Transforming batch data for backend compatibility...');

    try {
      await this.testConnection();

      const backendBatch = this.transformBatchForBackend(batch);

      console.log('📝 [DIAGNOSTIC] Backend batch format:', {
        id: backendBatch.id,
        // name: backendBatch.name, // removed to avoid confusion
        targetUrl: backendBatch.targetUrl,
        promptLength: backendBatch.prompt.length,
        platform: backendBatch.platform
      });

      const requestPayload: BackendBatchRequest = {
        batch: backendBatch,
        platform,
        settings: {
          ...settings,
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
      };

      const response = await this.makeRequest('/api/run-batch', {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      });

      console.log('✅ [DIAGNOSTIC] Enhanced batch execution completed successfully');
      return response;

    } catch (error) {
      console.error('💥 [DIAGNOSTIC] Enhanced batch execution failed:', error);
      throw error;
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, settings?: any): Promise<any> {
    console.log('🔄 Running batch with connection validation...');

    try {
      const isValid = await this.testConnection();
      if (!isValid) {
        throw new AutoPromptrError(
          'Backend connection validation failed',
          'CONNECTION_VALIDATION_ERROR',
          500,
          true
        );
      }

      return await this.runBatch(batch, platform, settings);
    } catch (error) {
      console.error('💥 Batch with validation failed:', error);
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>('/health', {
        method: 'GET',
      });

      const status = response.status?.toLowerCase();
      if (status !== 'ok') {
        throw new AutoPromptrError(
          'Backend health check failed',
          'HEALTH_CHECK_FAILED',
          0,
          false,
          'Backend returned non-OK status'
        );
      }

      return true;
    } catch (error) {
      console.error('❌ [DIAGNOSTIC] Backend connection test failed:', error);
      throw new AutoPromptrError(
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
