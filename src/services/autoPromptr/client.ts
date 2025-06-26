
import { Batch } from '@/types/batch';
import { AutoPromtrError } from './errors';
import { API_BASE_URL } from './config';

export class AutoPromptr {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  async getPlatforms() {
    try {
      const response = await fetch(`${this.baseUrl}/platforms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to fetch platforms',
          'PLATFORMS_FETCH_FAILED',
          response.status
        );
      }

      const platforms = await response.json();
      return Array.isArray(platforms) ? platforms : platforms.data || [];
    } catch (error) {
      console.error('Error fetching platforms:', error);
      
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AutoPromtrError(
          'Network error while fetching platforms',
          'NETWORK_ERROR',
          0
        );
      }
      
      // Return fallback platforms if the backend is not available
      return [
        { id: 'lovable', name: 'Lovable', type: 'web' },
        { id: 'chatgpt', name: 'ChatGPT', type: 'web' },
        { id: 'claude', name: 'Claude', type: 'web' },
        { id: 'generic-web', name: 'Generic Web Platform', type: 'web' }
      ];
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new AutoPromtrError(
          'Health check failed',
          'HEALTH_CHECK_FAILED',
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Health check failed',
        'HEALTH_CHECK_ERROR',
        0
      );
    }
  }

  async runBatch(batch: Batch, platform: string, options?: { waitForIdle?: boolean; maxRetries?: number }) {
    console.log('🚀 Starting batch run:', batch.id);
    
    try {
      // Try actual backend processing without fallback
      return await this.processWithBackend(batch, platform, options);
      
    } catch (error) {
      console.error('💥 Error in runBatch:', error);
      
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AutoPromtrError(
          `Network connection failed when trying to connect to ${this.baseUrl}. Please verify the backend URL is correct and the service is running.`,
          'NETWORK_CONNECTION_FAILED',
          0
        );
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UNKNOWN_ERROR',
        0
      );
    }
  }

  private async processWithBackend(batch: Batch, platform: string, options: any = {}): Promise<any> {
    const batchData = {
      id: batch.id,
      name: batch.name,
      targetUrl: batch.targetUrl,
      platform: platform,
      prompts: batch.prompts.map(prompt => ({
        id: prompt.id,
        text: prompt.text,
        order: prompt.order
      })),
      settings: {
        waitForIdle: options?.waitForIdle ?? true,
        maxRetries: options?.maxRetries ?? 0,
        ...batch.settings
      }
    };

    console.log('📤 Sending batch to backend:', batchData);

    // Try common automation endpoints
    const endpoints = ['/api/batch/run', '/api/batches', '/run-batch', '/batch'];
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${this.baseUrl}${endpoint}`);
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batchData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Backend processing started successfully:', result);
          return result;
        }

        if (response.status === 404) {
          console.log(`Endpoint ${endpoint} returned 404, trying next...`);
          continue;
        }

        const errorText = await response.text();
        console.error('❌ Backend error response:', response.status, errorText);
        
        throw new AutoPromtrError(
          `Backend returned ${response.status} error: ${errorText || response.statusText}`,
          'BACKEND_ERROR',
          response.status
        );
      } catch (fetchError) {
        console.error(`Fetch error for ${endpoint}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error');
        
        // If it's not a 404, throw the error immediately
        if (fetchError instanceof AutoPromtrError && fetchError.statusCode !== 404) {
          throw fetchError;
        }
        
        continue;
      }
    }

    // All endpoints failed
    console.error('All automation endpoints returned 404. Backend may need configuration.');
    throw new AutoPromtrError(
      `The backend automation service is not configured with the expected endpoints. This could mean: 1) The backend needs to be updated to support batch automation, 2) The backend URL is incorrect, or 3) The automation service is not deployed. Please check your backend configuration in Settings.`,
      'AUTOMATION_ENDPOINTS_NOT_CONFIGURED',
      404
    );
  }

  async stopBatch(batchId: string) {
    try {
      const stopEndpoints = ['/api/batch/stop', '/stop-batch', '/api/stop'];
      
      for (const endpoint of stopEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}/${batchId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            return await response.json();
          }
          
          if (response.status !== 404) {
            throw new AutoPromtrError(
              'Failed to stop batch',
              'STOP_BATCH_FAILED',
              response.status
            );
          }
        } catch (fetchError) {
          if (fetchError instanceof AutoPromtrError) {
            throw fetchError;
          }
          continue;
        }
      }
      
      throw new AutoPromtrError(
        'Backend stop endpoints not found or not responding',
        'STOP_ENDPOINTS_NOT_CONFIGURED',
        404
      );
      
    } catch (error) {
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Failed to stop batch',
        'STOP_BATCH_ERROR',
        0
      );
    }
  }

  async getBatchStatus(batchId: string) {
    try {
      const statusEndpoints = ['/api/batch/status', '/batch-status', '/api/status'];
      
      for (const endpoint of statusEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}/${batchId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            return await response.json();
          }
          
          if (response.status !== 404) {
            throw new AutoPromtrError(
              'Failed to get batch status',
              'STATUS_CHECK_FAILED',
              response.status
            );
          }
        } catch (fetchError) {
          if (fetchError instanceof AutoPromtrError) {
            throw fetchError;
          }
          continue;
        }
      }
      
      throw new AutoPromtrError(
        'Backend status endpoints not found or not responding',
        'STATUS_ENDPOINTS_NOT_CONFIGURED',
        404
      );
      
    } catch (error) {
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Failed to get batch status',
        'STATUS_CHECK_ERROR',
        0
      );
    }
  }
}
