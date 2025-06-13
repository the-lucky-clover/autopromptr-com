
import { SecureApiClient } from '../security/secureApiClient';
import { InputValidationService } from '../security/inputValidation';
import { AutoPromtrError } from './errors';
import { Batch } from '@/types/batch';
import { API_BASE_URL } from './config';

export class SecureAutoPromptr extends SecureApiClient {
  constructor(baseUrl?: string) {
    super(baseUrl || API_BASE_URL);
  }

  async getPlatforms() {
    try {
      const response = await this.get('/platforms', { timeout: 10000 });

      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to fetch platforms',
          'PLATFORMS_FETCH_FAILED',
          response.status
        );
      }

      const platforms = await response.json();
      
      // Validate response structure
      if (!Array.isArray(platforms) && !platforms.data) {
        throw new AutoPromtrError(
          'Invalid platforms response format',
          'INVALID_RESPONSE_FORMAT',
          200
        );
      }

      return Array.isArray(platforms) ? platforms : platforms.data || [];
    } catch (error) {
      console.error('Error fetching platforms:', error);
      
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      // Handle network errors securely
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AutoPromtrError(
          'Network error while fetching platforms',
          'NETWORK_ERROR',
          0
        );
      }
      
      // Return secure fallback platforms
      return [
        { id: 'lovable', name: 'Lovable', type: 'web' },
        { id: 'chatgpt', name: 'ChatGPT', type: 'web' },
        { id: 'claude', name: 'Claude', type: 'web' },
        { id: 'generic-web', name: 'Generic Web Platform', type: 'web' }
      ];
    }
  }

  async runBatch(batch: Batch, platform: string, options?: { waitForIdle?: boolean; maxRetries?: number }) {
    console.log('🔒 Starting secure batch run:', batch.id);
    
    // Input validation
    const nameValidation = InputValidationService.validateBatchName(batch.name);
    if (!nameValidation.isValid) {
      throw new AutoPromtrError(
        nameValidation.error || 'Invalid batch name',
        'INVALID_BATCH_NAME',
        400
      );
    }

    if (!InputValidationService.validateUrl(batch.targetUrl)) {
      throw new AutoPromtrError(
        'Invalid target URL format',
        'INVALID_TARGET_URL',
        400
      );
    }

    // Validate prompts
    for (const prompt of batch.prompts) {
      const promptValidation = InputValidationService.validatePromptText(prompt.text);
      if (!promptValidation.isValid) {
        throw new AutoPromtrError(
          promptValidation.error || 'Invalid prompt text',
          'INVALID_PROMPT_TEXT',
          400
        );
      }
    }

    try {
      // First, validate the backend is accessible
      const healthResponse = await this.get('/health', { timeout: 5000 });

      if (!healthResponse.ok) {
        throw new AutoPromtrError(
          'Backend health check failed',
          'BACKEND_HEALTH_FAILED',
          healthResponse.status
        );
      }

      // Prepare sanitized batch data
      const sanitizedBatch = {
        id: batch.id,
        name: InputValidationService.sanitizeInput(batch.name),
        targetUrl: batch.targetUrl, // Already validated
        platform: platform,
        prompts: batch.prompts.map(prompt => ({
          id: prompt.id,
          text: InputValidationService.sanitizeInput(prompt.text),
          order: prompt.order
        })),
        settings: {
          waitForIdle: options?.waitForIdle ?? true,
          maxRetries: Math.min(options?.maxRetries ?? 0, 5), // Limit retries
          ...batch.settings
        }
      };

      console.log('🔒 Sending sanitized batch to backend:', sanitizedBatch);

      // Try secure endpoints with rate limiting
      const endpoints = ['/api/batch/run', '/api/batches', '/run-batch', '/batch'];
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await this.post(endpoint, sanitizedBatch, { 
            timeout: 60000,
            retries: 2
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Secure batch processing started:', result);
            return result;
          }

          if (response.status === 404) {
            continue; // Try next endpoint
          }

          // Handle other errors securely
          const errorText = await response.text();
          console.error('❌ Backend error response:', response.status, errorText);
          
          throw new AutoPromtrError(
            response.status >= 500 ? 'Backend server error' : `Backend error: ${response.status}`,
            response.status >= 500 ? 'SERVER_ERROR' : 'BACKEND_ERROR',
            response.status
          );
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error');
          continue;
        }
      }

      // All endpoints failed
      throw new AutoPromtrError(
        'Automation service endpoints not available. Please check backend configuration.',
        'AUTOMATION_ENDPOINTS_NOT_CONFIGURED',
        404
      );

    } catch (error) {
      console.error('💥 Secure batch run error:', error);
      
      if (error instanceof AutoPromtrError) {
        throw error;
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UNKNOWN_ERROR',
        0
      );
    }
  }

  async stopBatch(batchId: string) {
    // Input validation
    if (!batchId || typeof batchId !== 'string') {
      throw new AutoPromtrError(
        'Invalid batch ID',
        'INVALID_BATCH_ID',
        400
      );
    }

    try {
      const stopEndpoints = ['/api/batch/stop', '/stop-batch', '/api/stop'];
      
      for (const endpoint of stopEndpoints) {
        try {
          const response = await this.post(`${endpoint}/${batchId}`, undefined, {
            timeout: 30000,
            retries: 2
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
        'Stop batch endpoints not found',
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
}
