
import { Batch } from '@/types/batch';
import { AutoPromptprError } from './autoPromptr';

export class RedundantAutoPromptr {
  private primaryUrl: string;
  private fallbackUrls: string[];

  constructor() {
    this.primaryUrl = 'https://autopromptr-backend.onrender.com';
    this.fallbackUrls = [
      'https://autopromptr-backup.onrender.com',
      'https://autopromptr-fallback.herokuapp.com'
    ];
  }

  async runBatchWithRedundancy(batch: Batch, platform: string, options: any = {}) {
    console.log('🔄 Starting redundant batch execution...');
    
    // Try primary backend first
    try {
      const primaryClient = new (await import('./autoPromptr')).AutoPromptr(this.primaryUrl);
      const result = await primaryClient.runBatch(batch, platform, options);
      console.log('✅ Primary backend succeeded');
      return result;
    } catch (primaryError) {
      console.warn('⚠️ Primary backend failed, trying fallbacks:', primaryError);
      
      // Try fallback backends
      for (const fallbackUrl of this.fallbackUrls) {
        try {
          console.log(`🔄 Trying fallback: ${fallbackUrl}`);
          const fallbackClient = new (await import('./autoPromptr')).AutoPromptr(fallbackUrl);
          const result = await fallbackClient.runBatch(batch, platform, options);
          console.log(`✅ Fallback backend succeeded: ${fallbackUrl}`);
          return result;
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback failed: ${fallbackUrl}`, fallbackError);
          continue;
        }
      }
      
      // All backends failed
      throw new AutoPromptprError(
        'All backend services are unavailable',
        'ALL_BACKENDS_FAILED',
        503,
        true,
        'Primary and all fallback backend services are currently unavailable. Please try again later.'
      );
    }
  }

  async validateConnections() {
    const results = {
      primary: false,
      fallbacks: [] as boolean[],
      recommendation: ''
    };

    // Test primary
    try {
      const primaryClient = new (await import('./autoPromptr')).AutoPromptr(this.primaryUrl);
      await primaryClient.healthCheck();
      results.primary = true;
    } catch (error) {
      console.warn('Primary backend unavailable:', error);
    }

    // Test fallbacks
    for (const fallbackUrl of this.fallbackUrls) {
      try {
        const fallbackClient = new (await import('./autoPromptr')).AutoPromptr(fallbackUrl);
        await fallbackClient.healthCheck();
        results.fallbacks.push(true);
      } catch (error) {
        results.fallbacks.push(false);
      }
    }

    // Generate recommendation
    if (results.primary) {
      results.recommendation = 'Primary backend is available - optimal performance';
    } else if (results.fallbacks.some(f => f)) {
      results.recommendation = 'Primary backend unavailable, but fallbacks are ready';
    } else {
      results.recommendation = 'All backend services are currently unavailable';
    }

    return results;
  }

  getBackendConfiguration() {
    return {
      primary: this.primaryUrl,
      fallbacks: this.fallbackUrls,
      strategy: 'redundant-failover'
    };
  }
}
