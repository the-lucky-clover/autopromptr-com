import { Batch } from '@/types/batch';
import { AutoPromptr } from './autoPromptr';
import { AutoPromptrError } from './autoPromptr';

export class RedundantAutoPromptr {
  private primaryClient: AutoPromptr;
  private fallbackClient: AutoPromptr;

  constructor(primaryUrl?: string, fallbackUrl?: string) {
    this.primaryClient = new AutoPromptr(primaryUrl);
    this.fallbackClient = new AutoPromptr(fallbackUrl || primaryUrl);
  }

  async runBatch(batch: Batch, platform: string, options?: any): Promise<any> {
    try {
      return await this.primaryClient.runBatch(batch, platform, options);
    } catch (error) {
      console.warn('Primary client failed, trying fallback:', error);
      try {
        return await this.fallbackClient.runBatch(batch, platform, options);
      } catch (fallbackError) {
        throw new AutoPromptrError(
          'Both primary and fallback clients failed',
          'REDUNDANT_FAILURE',
          500,
          true
        );
      }
    }
  }

  async stopBatch(batchId: string): Promise<any> {
    try {
      await this.primaryClient.stopBatch(batchId);
    } catch (error) {
      console.warn('Primary client failed to stop batch, trying fallback:', error);
      try {
        await this.fallbackClient.stopBatch(batchId);
      } catch (fallbackError) {
        throw new AutoPromptrError(
          'Both primary and fallback clients failed to stop batch',
          'REDUNDANT_FAILURE',
          500,
          true
        );
      }
    }
  }

  async getPlatforms(): Promise<any[]> {
    try {
      return await this.primaryClient.getPlatforms();
    } catch (error) {
      console.warn('Primary client failed to get platforms, trying fallback:', error);
      try {
        return await this.fallbackClient.getPlatforms();
      } catch (fallbackError) {
        throw new AutoPromptrError(
          'Both primary and fallback clients failed to get platforms',
          'REDUNDANT_FAILURE',
          500,
          true
        );
      }
    }
  }
}
