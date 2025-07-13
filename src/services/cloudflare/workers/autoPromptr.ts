
// Cloudflare Workers client parallel to existing AutoPromptr service
import { Batch } from '@/types/batch';
import { CLOUDFLARE_CONFIG } from '../config';

export class CloudflareAutoPromptr {
  private workerUrl: string;

  constructor(workerUrl?: string) {
    this.workerUrl = workerUrl || CLOUDFLARE_CONFIG.WORKER_BASE_URL;
  }

  async runBatch(batch: Batch, platform: string, options?: any): Promise<any> {
    try {
      const response = await fetch(`${this.workerUrl}/api/run-batch`, {
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
        throw new Error(`Cloudflare Worker HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CloudflareAutoPromptr.runBatch error:', error);
      throw error;
    }
  }

  async stopBatch(batchId: string): Promise<any> {
    const response = await fetch(`${this.workerUrl}/api/batch/${batchId}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to stop batch via Cloudflare Worker: HTTP ${response.status}`);
    }

    return await response.json();
  }

  async getPlatforms(): Promise<any[]> {
    try {
      const response = await fetch(`${this.workerUrl}/api/platforms`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch platforms from Cloudflare Worker: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CloudflareAutoPromptr.getPlatforms error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.workerUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Cloudflare Worker health check failed: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CloudflareAutoPromptr.healthCheck error:', error);
      throw error;
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    try {
      const response = await fetch(`${this.workerUrl}/api/batch/${batchId}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get batch status from Cloudflare Worker: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CloudflareAutoPromptr.getBatchStatus error:', error);
      throw error;
    }
  }
}
