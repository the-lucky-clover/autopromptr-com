
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
  private connectionDiagnostics: ConnectionDiagnostics;

  constructor() {
    this.primaryBackend = {
      name: 'AutoPromptr Backend',
      url: 'https://autopromptr-backend.onrender.com',
      maxRetries: 3,
      retryDelay: 60000 // 60 seconds
    };

    this.connectionDiagnostics = new ConnectionDiagnostics();
    console.log('🔄 Simplified AutoPromptr initialized with autopromptr-backend only');
  }

  async runBatchWithRedundancy(batch: Batch, platform: string, options: any = {}): Promise<any> {
    console.log('🚀 Starting batch run with autopromptr-backend...');
    console.log(`📋 Batch: ${batch.name} (${batch.id})`);
    console.log(`🎯 Platform: ${platform}`);
    
    for (let attempt = 1; attempt <= this.primaryBackend.maxRetries; attempt++) {
      try {
        console.log(`📡 AutoPromptr Backend - Attempt ${attempt}/${this.primaryBackend.maxRetries}`);
        
        const autoPromptr = new AutoPromptr(this.primaryBackend.url);
        
        const enhancedOptions = {
          ...options,
          targetUrl: batch.targetUrl || 'https://lovable.dev',
          textPrompts: batch.prompts || [],
          automationType: 'enhanced-lovable-automation',
          elementSelector: 'textarea, input[type="text"], [contenteditable="true"]',
          actionType: 'multi-strategy-submission',
          enhancedFeatures: true
        };
        
        console.log(`📝 Transmitting to ${this.primaryBackend.name}:`, {
          targetUrl: enhancedOptions.targetUrl,
          promptCount: enhancedOptions.textPrompts.length,
          automationType: enhancedOptions.automationType,
          enhanced: enhancedOptions.enhancedFeatures
        });
        
        const result = await autoPromptr.runBatch(batch, platform, enhancedOptions);
        
        console.log(`✅ AutoPromptr Backend succeeded on attempt ${attempt}`);
        return {
          success: true,
          result,
          backend: this.primaryBackend.name,
          attempt
        };
        
      } catch (err) {
        console.error(`❌ AutoPromptr Backend attempt ${attempt} failed:`, err);
        
        if (attempt < this.primaryBackend.maxRetries) {
          console.log(`⏳ Waiting ${this.primaryBackend.retryDelay / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.primaryBackend.retryDelay));
        } else {
          console.error(`💥 AutoPromptr Backend failed all ${this.primaryBackend.maxRetries} attempts`);
          throw new AutoPromtrError(
            `AutoPromptr Backend failed after ${this.primaryBackend.maxRetries} attempts`,
            'BACKEND_EXHAUSTED',
            503,
            false
          );
        }
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

    if (results.primary) {
      results.recommendation = 'AutoPromptr Backend operational';
    } else {
      results.recommendation = 'AutoPromptr Backend may be unavailable - check connectivity';
    }

    return results;
  }

  getBackendConfiguration() {
    return {
      primary: this.primaryBackend,
      fallback: null,
      totalMaxAttempts: this.primaryBackend.maxRetries,
      totalMaxDuration: this.primaryBackend.maxRetries * 60
    };
  }
}
