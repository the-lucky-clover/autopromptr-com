
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { Batch } from '@/types/batch';

interface BackendConfig {
  name: string;
  url: string;
  maxRetries: number;
  retryDelay: number;
}

export class RedundantAutoPromptr {
  private primaryBackend: BackendConfig;
  private fallbackBackend: BackendConfig;
  private connectionDiagnostics: ConnectionDiagnostics;

  constructor() {
    this.primaryBackend = {
      name: 'Puppeteer Backend',
      url: 'https://puppeteer-backend-da0o.onrender.com',
      maxRetries: 3,
      retryDelay: 60000 // 60 seconds
    };

    this.fallbackBackend = {
      name: 'AutoPromptr Backend', 
      url: 'https://autopromptr-backend.onrender.com',
      maxRetries: 3,
      retryDelay: 60000 // 60 seconds
    };

    this.connectionDiagnostics = new ConnectionDiagnostics();
    console.log('🔄 Redundant AutoPromptr initialized with failover support');
  }

  private async attemptWithBackend(backend: BackendConfig, batch: Batch, platform: string, options: any = {}): Promise<any> {
    console.log(`🎯 Attempting with ${backend.name} (${backend.url})`);
    
    for (let attempt = 1; attempt <= backend.maxRetries; attempt++) {
      try {
        console.log(`📡 ${backend.name} - Attempt ${attempt}/${backend.maxRetries}`);
        
        const autoPromptr = new AutoPromptr(backend.url);
        
        // Enhanced options to include target URL and text prompts for Lovable coding bot workflow
        const enhancedOptions = {
          ...options,
          targetUrl: batch.targetUrl || 'https://lovable.dev',
          textPrompts: batch.prompts || [],
          automationType: 'lovable-text-input',
          elementSelector: 'textarea, input[type="text"], [contenteditable="true"]',
          actionType: 'type-and-enter'
        };
        
        console.log(`📝 Transmitting to ${backend.name}:`, {
          targetUrl: enhancedOptions.targetUrl,
          promptCount: enhancedOptions.textPrompts.length,
          automationType: enhancedOptions.automationType
        });
        
        const result = await autoPromptr.runBatch(batch, platform, enhancedOptions);
        
        console.log(`✅ ${backend.name} succeeded on attempt ${attempt}`);
        return {
          success: true,
          result,
          backend: backend.name,
          attempt
        };
        
      } catch (err) {
        console.error(`❌ ${backend.name} attempt ${attempt} failed:`, err);
        
        if (attempt < backend.maxRetries) {
          console.log(`⏳ Waiting ${backend.retryDelay / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, backend.retryDelay));
        } else {
          console.error(`💥 ${backend.name} failed all ${backend.maxRetries} attempts`);
          throw new AutoPromtrError(
            `${backend.name} failed after ${backend.maxRetries} attempts`,
            'BACKEND_EXHAUSTED',
            503,
            false
          );
        }
      }
    }
  }

  async runBatchWithRedundancy(batch: Batch, platform: string, options: any = {}): Promise<any> {
    console.log('🚀 Starting redundant batch run with failover...');
    console.log(`📋 Batch: ${batch.name} (${batch.id})`);
    console.log(`🎯 Platform: ${platform}`);
    
    try {
      // Try primary backend first
      console.log('🔵 Phase 1: Attempting with primary backend...');
      const primaryResult = await this.attemptWithBackend(this.primaryBackend, batch, platform, options);
      return primaryResult;
      
    } catch (primaryErr) {
      console.warn('🟡 Primary backend exhausted, switching to fallback...');
      
      try {
        // Try fallback backend
        console.log('🟠 Phase 2: Attempting with fallback backend...');
        const fallbackResult = await this.attemptWithBackend(this.fallbackBackend, batch, platform, options);
        return fallbackResult;
        
      } catch (fallbackErr) {
        console.error('🔴 Both backends exhausted - complete failure');
        
        // Both backends failed
        throw new AutoPromtrError(
          `Complete automation failure: Both ${this.primaryBackend.name} and ${this.fallbackBackend.name} failed after ${this.primaryBackend.maxRetries + this.fallbackBackend.maxRetries} total attempts over ${((this.primaryBackend.maxRetries + this.fallbackBackend.maxRetries) * 60)} seconds.`,
          'REDUNDANCY_EXHAUSTED',
          503,
          false
        );
      }
    }
  }

  async validateConnections(): Promise<{
    primary: boolean;
    fallback: boolean;
    recommendation: string;
  }> {
    const results = {
      primary: false,
      fallback: false,
      recommendation: ''
    };

    try {
      const primaryDiagnostics = new ConnectionDiagnostics(this.primaryBackend.url);
      const primaryTest = await primaryDiagnostics.runComprehensiveTest();
      results.primary = primaryTest.overallSuccess;
    } catch (err) {
      console.warn('Primary backend validation failed:', err);
    }

    try {
      const fallbackDiagnostics = new ConnectionDiagnostics(this.fallbackBackend.url);
      const fallbackTest = await fallbackDiagnostics.runComprehensiveTest();
      results.fallback = fallbackTest.overallSuccess;
    } catch (err) {
      console.warn('Fallback backend validation failed:', err);
    }

    if (results.primary && results.fallback) {
      results.recommendation = 'Both backends are operational - full redundancy available';
    } else if (results.primary) {
      results.recommendation = 'Primary backend operational, fallback may be unavailable';
    } else if (results.fallback) {
      results.recommendation = 'Primary backend unavailable, fallback operational';
    } else {
      results.recommendation = 'Both backends may be unavailable - check connectivity';
    }

    return results;
  }

  getBackendConfiguration() {
    return {
      primary: this.primaryBackend,
      fallback: this.fallbackBackend,
      totalMaxAttempts: this.primaryBackend.maxRetries + this.fallbackBackend.maxRetries,
      totalMaxDuration: (this.primaryBackend.maxRetries + this.fallbackBackend.maxRetries) * 60
    };
  }
}
