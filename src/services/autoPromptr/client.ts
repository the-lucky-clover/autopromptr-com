
import { Batch, AutoPromtrBackendRequest, AutoPromtrBackendResponse } from '@/types/batch';
import { AutoPromtrError } from './errors';
import { API_BASE_URL } from './config';

export class AutoPromptr {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://autopromptr-backend.onrender.com';
  }

  async getPlatforms() {
    try {
      // Fallback platforms since backend may not have this endpoint
      return [
        { id: 'lovable', name: 'Lovable', type: 'web' },
        { id: 'chatgpt', name: 'ChatGPT', type: 'web' },
        { id: 'claude', name: 'Claude', type: 'web' },
        { id: 'v0', name: 'v0.dev', type: 'web' },
        { id: 'bolt', name: 'Bolt.new', type: 'web' },
        { id: 'generic-web', name: 'Generic Web Platform', type: 'web' }
      ];
    } catch (error) {
      console.error('Error fetching platforms:', error);
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
    console.log('🚀 Starting batch run with new backend:', batch.id);
    
    try {
      // Process each prompt individually since backend expects single prompt
      const results: AutoPromtrBackendResponse[] = [];
      
      for (let i = 0; i < batch.prompts.length; i++) {
        const prompt = batch.prompts[i];
        console.log(`Processing prompt ${i + 1}/${batch.prompts.length}:`, prompt.text);
        
        const request: AutoPromtrBackendRequest = {
          batch: {
            id: `${batch.id}-${i}`,
            prompt: prompt.text,
            targetUrl: batch.targetUrl
          },
          platform: 'lovable.dev',
          wait_for_idle: options?.waitForIdle ?? true,
          max_retries: options?.maxRetries ?? 3
        };

        const result = await this.processWithBackend(request);
        results.push(result);
        
        // If any prompt fails, stop processing
        if (result.status === 'failed') {
          throw new AutoPromtrError(
            `Batch failed at prompt ${i + 1}: ${result.error || 'Unknown error'}`,
            'BATCH_PROCESSING_FAILED',
            500
          );
        }
      }
      
      console.log('✅ All prompts processed successfully:', results);
      return {
        batchId: batch.id,
        status: 'completed',
        results: results,
        totalPrompts: batch.prompts.length,
        completedPrompts: results.filter(r => r.status === 'completed').length
      };
      
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

  private async processWithBackend(request: AutoPromtrBackendRequest): Promise<AutoPromtrBackendResponse> {
    console.log('📤 Sending request to backend:', request);

    try {
      const response = await fetch(`${this.baseUrl}/api/run-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', response.status, errorText);
        
        throw new AutoPromtrError(
          `Backend returned ${response.status} error: ${errorText || response.statusText}`,
          'BACKEND_ERROR',
          response.status
        );
      }

      const result: AutoPromtrBackendResponse = await response.json();
      console.log('✅ Backend processing completed:', result);
      return result;

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      if (fetchError instanceof AutoPromtrError) {
        throw fetchError;
      }
      
      throw new AutoPromtrError(
        fetchError instanceof Error ? fetchError.message : 'Network error occurred',
        'NETWORK_ERROR',
        0
      );
    }
  }

  async stopBatch(batchId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/stop/${batchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new AutoPromtrError(
        'Failed to stop batch',
        'STOP_BATCH_FAILED',
        response.status
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
      const response = await fetch(`${this.baseUrl}/api/status/${batchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new AutoPromtrError(
        'Failed to get batch status',
        'STATUS_CHECK_FAILED',
        response.status
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
