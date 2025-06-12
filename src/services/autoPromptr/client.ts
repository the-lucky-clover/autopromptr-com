
import { Batch } from '@/types/batch';
import { AutoPromtrError } from './errors';
import { API_BASE_URL } from './config';

export class AutoPromptr {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
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

      // Send the batch for processing
      const response = await fetch(`${this.baseUrl}/process-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', response.status, errorText);
        
        // Handle specific error cases
        if (response.status === 404) {
          throw new AutoPromtrError(
            'Batch processing endpoint not found. Please check backend configuration.',
            'ENDPOINT_NOT_FOUND',
            404
          );
        } else if (response.status >= 500) {
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
      }

      const result = await response.json();
      console.log('✅ Batch processing started successfully:', result);
      
      return result;
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
      const response = await fetch(`${this.baseUrl}/stop-batch/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to stop batch',
          'STOP_BATCH_FAILED',
          response.status
        );
      }

      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/batch-status/${batchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new AutoPromtrError(
          'Failed to get batch status',
          'STATUS_CHECK_FAILED',
          response.status
        );
      }

      return await response.json();
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
