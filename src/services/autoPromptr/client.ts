
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
    console.log('🚀 Starting batch run with enhanced error handling:', batch.id);
    
    try {
      // First, validate the backend is accessible
      const healthResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        throw new AutoPromtrError(
          'Backend health check failed',
          'BACKEND_HEALTH_FAILED',
          healthResponse.status
        );
      }

      // Prepare the batch data for processing
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

      // Updated endpoints based on typical backend patterns - try the most common ones
      const endpoints = ['/api/batch/run', '/api/batches', '/run-batch', '/batch'];
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(batchData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Batch processing started successfully:', result);
            return result;
          }

          if (response.status === 404) {
            // Try next endpoint
            continue;
          }

          // Handle other errors
          const errorText = await response.text();
          console.error('❌ Backend error response:', response.status, errorText);
          
          if (response.status >= 500) {
            throw new AutoPromtrError(
              'Backend server error. The backend may be down or misconfigured.',
              'SERVER_ERROR',
              response.status
            );
          } else {
            throw new AutoPromtrError(
              `Backend returned error: ${errorText}`,
              'BACKEND_ERROR',
              response.status
            );
          }
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error');
          continue;
        }
      }

      // If we get here, all endpoints failed - provide helpful guidance
      console.error('All automation endpoints returned 404. Backend may need configuration.');
      
      throw new AutoPromtrError(
        'The backend automation service is not configured with the expected endpoints. This could mean: 1) The backend needs to be updated to support batch automation, 2) The backend URL is incorrect, or 3) The automation service is not deployed. Please check your backend configuration in Settings.',
        'AUTOMATION_ENDPOINTS_NOT_CONFIGURED',
        404
      );

    } catch (error) {
      console.error('💥 Error in runBatch:', error);
      
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AutoPromtrError(
          'Failed to connect to backend. Please check the backend URL in settings.',
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

  async stopBatch(batchId: string) {
    try {
      // Try multiple possible stop endpoints
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
        'Stop batch endpoints not found on backend',
        'STOP_ENDPOINTS_NOT_FOUND',
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
      // Try multiple possible status endpoints
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
        'Status check endpoints not found on backend',
        'STATUS_ENDPOINTS_NOT_FOUND',
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
