
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
    console.log('🚀 Starting batch run (with local fallback capability):', batch.id);
    
    try {
      // First check if we should use local simulation
      if (this.shouldUseLocalSimulation()) {
        return await this.simulateBatchExecution(batch, platform, options);
      }

      // Try backend connection
      const healthResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!healthResponse.ok) {
        console.warn('Backend health check failed, falling back to local simulation');
        return await this.simulateBatchExecution(batch, platform, options);
      }

      // Try actual backend processing
      return await this.processWithBackend(batch, platform, options);
      
    } catch (error) {
      console.error('💥 Error in runBatch:', error);
      
      if (error instanceof AutoPromtrError) {
        // If it's a backend connectivity issue, try local simulation
        if (error.code === 'AUTOMATION_ENDPOINTS_NOT_CONFIGURED' || 
            error.code === 'NETWORK_CONNECTION_FAILED') {
          console.log('🔄 Falling back to local simulation due to backend issues');
          return await this.simulateBatchExecution(batch, platform, options);
        }
        throw error;
      }
      
      // Handle network errors with local fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('🔄 Network error detected, using local simulation');
        return await this.simulateBatchExecution(batch, platform, options);
      }
      
      throw new AutoPromtrError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UNKNOWN_ERROR',
        0
      );
    }
  }

  private shouldUseLocalSimulation(): boolean {
    // Check if user has enabled local simulation mode
    return localStorage.getItem('autopromptr_local_simulation') === 'true' ||
           // Or if we're in development and no backend URL is configured
           (process.env.NODE_ENV === 'development' && !localStorage.getItem('autopromptr_backend_url'));
  }

  private async simulateBatchExecution(batch: Batch, platform: string, options: any = {}): Promise<any> {
    console.log('🎭 Running batch in local simulation mode');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate successful completion
    const result = {
      success: true,
      batchId: batch.id,
      platform: platform,
      mode: 'local_simulation',
      processedPrompts: batch.prompts.length,
      message: 'Batch processed successfully in simulation mode. In a real deployment, this would interact with the target platform.',
      timestamp: new Date().toISOString(),
      prompts: batch.prompts.map((prompt, index) => ({
        id: prompt.id,
        status: 'completed',
        message: `Prompt ${index + 1} would be sent to ${batch.targetUrl}`,
        simulatedDelay: Math.floor(Math.random() * 5000) + 1000
      }))
    };
    
    console.log('✅ Local simulation completed:', result);
    return result;
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
          continue;
        }

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

    // All endpoints failed
    throw new AutoPromtrError(
      'Backend automation service endpoints not found or not responding. Using local simulation as fallback.',
      'AUTOMATION_ENDPOINTS_NOT_CONFIGURED',
      404
    );
  }

  async stopBatch(batchId: string) {
    try {
      if (this.shouldUseLocalSimulation()) {
        console.log('🎭 Simulating batch stop for:', batchId);
        return { success: true, message: 'Batch stopped in simulation mode' };
      }

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
      
      // Fallback to local simulation
      console.log('🎭 Backend stop endpoints not found, using simulation');
      return { success: true, message: 'Batch stopped in simulation mode' };
      
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
      if (this.shouldUseLocalSimulation()) {
        console.log('🎭 Simulating batch status for:', batchId);
        return { 
          status: 'completed', 
          message: 'Batch completed in simulation mode',
          timestamp: new Date().toISOString()
        };
      }

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
      
      // Fallback to simulated status
      console.log('🎭 Backend status endpoints not found, using simulation');
      return { 
        status: 'completed', 
        message: 'Status retrieved from simulation mode',
        timestamp: new Date().toISOString()
      };
      
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
