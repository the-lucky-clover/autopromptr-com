
import { Batch } from '@/types/batch';
import { AutoPromptrError } from './errors';
import { USE_CLOUDFLARE, BACKEND_MODE, LEGACY_BACKEND_URL, CLOUDFLARE_WORKER_URL } from './config';
import { cloudflareBackend } from '../cloudflareBackend';

export class AutoPromptr {
  public baseUrl: string;
  private useCloudflare: boolean;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || CLOUDFLARE_WORKER_URL || 'https://autopromptr-worker.autopromptr.workers.dev';
    this.useCloudflare = USE_CLOUDFLARE || BACKEND_MODE === 'cloudflare';
  }

  async runBatch(batch: Batch, platform: string, options?: any): Promise<any> {
    try {
      if (this.useCloudflare) {
        console.log('🚀 [AutoPromptr] Using Cloudflare Workers backend:', {
          batchId: batch.id,
          platform,
        });

        // Use Cloudflare Workers backend
        const result = await cloudflareBackend.runBatchCombined(
          {
            name: batch.name,
            description: batch.description,
            prompts: batch.prompts.map(p => ({ text: p.text })),
            targetUrl: batch.settings?.targetUrlOverride || '',
          },
          platform,
          options
        );

        console.log('✅ [AutoPromptr] Cloudflare Workers success:', result);
        return result;
      }

      // Legacy Render.com backend (fallback)
      console.log('🚀 [AutoPromptr] Sending batch to legacy backend:', {
        batchId: batch.id,
        platform,
        url: `${this.baseUrl}/api/run-batch`
      });

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

      console.log('📥 [AutoPromptr] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AutoPromptr] HTTP error:', response.status, errorText);
        throw new AutoPromptrError(
          `HTTP ${response.status}: ${errorText}`,
          'HTTP_ERROR',
          response.status,
          true
        );
      }

      const result = await response.json();
      console.log('✅ [AutoPromptr] Success response:', result);
      return result;
    } catch (error) {
      console.error('❌ [AutoPromptr] Error running batch:', error);
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  async stopBatch(batchId: string): Promise<any> {
    if (this.useCloudflare) {
      return await cloudflareBackend.stopBatch(batchId);
    }

    // Legacy backend
    const response = await fetch(`${this.baseUrl}/api/batches/${batchId}/stop`, {
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
      if (this.useCloudflare) {
        // Return built-in platform list for Cloudflare Workers
        return [
          { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com' },
          { id: 'claude', name: 'Claude', url: 'https://claude.ai' },
          { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev' },
          { id: 'v0', name: 'v0.dev', url: 'https://v0.dev' },
          { id: 'cursor', name: 'Cursor', url: 'https://cursor.sh' },
          { id: 'windsurf', name: 'Windsurf', url: '' },
          { id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com' },
          { id: 'web', name: 'Custom URL', url: '' },
        ];
      }

      // Legacy backend
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
      if (this.useCloudflare) {
        return await cloudflareBackend.healthCheck();
      }

      // Legacy backend
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
      if (this.useCloudflare) {
        return await cloudflareBackend.getBatchStatus(batchId);
      }

      // Legacy backend
      const response = await fetch(`${this.baseUrl}/api/batches/${batchId}/status`);
      
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
