
import { Batch } from '@/types/batch';
import { AutoPromptrError } from './errors';

export class AutoPromptr {
  public baseUrl: string; // Make baseUrl public

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'https://autopromptr-backend.onrender.com';
  }

  async runBatch(batch: Batch, platform: string, options?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/run-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch,
          platform,
          ...options
        })
      });

      if (!response.ok) {
        throw new AutoPromptrError(
          `HTTP ${response.status}`,
          'HTTP_ERROR',
          response.status,
          true
        );
      }

      return await response.json();
    } catch (error) {
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async stopBatch(batchId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/batch/${batchId}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new AutoPromptrError(
        `Failed to stop batch: HTTP ${response.status}`,
        'STOP_BATCH_ERROR',
        response.status,
        true
      );
    }

    return await response.json();
  }

  async getPlatforms(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/platforms`);
      
      if (!response.ok) {
        throw new AutoPromptrError(
          `Failed to fetch platforms: HTTP ${response.status}`,
          'PLATFORMS_ERROR',
          response.status,
          true
        );
      }

      return await response.json();
    } catch (error) {
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new AutoPromptrError(
          `Health check failed: HTTP ${response.status}`,
          'HEALTH_CHECK_ERROR',
          response.status,
          true
        );
      }

      return await response.json();
    } catch (error) {
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/batch/${batchId}/status`);
      
      if (!response.ok) {
        throw new AutoPromptrError(
          `Failed to get batch status: HTTP ${response.status}`,
          'BATCH_STATUS_ERROR',
          response.status,
          true
        );
      }

      return await response.json();
    } catch (error) {
      throw AutoPromptrError.fromBackendError(error);
    }
  }
}
