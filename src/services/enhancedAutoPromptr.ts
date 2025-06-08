
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;
  private validationCache: { isValid: boolean; timestamp: number } | null = null;
  private readonly VALIDATION_CACHE_DURATION = 60000; // 1 minute cache

  constructor() {
    const savedUrl = 'https://puppeteer-backend-da0o.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    
    console.log('🔧 Enhanced AutoPromptr initialized');
  }

  async validateConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached validation if recent
    if (this.validationCache && (now - this.validationCache.timestamp) < this.VALIDATION_CACHE_DURATION) {
      console.log('Using cached validation result:', this.validationCache.isValid);
      return this.validationCache.isValid;
    }

    try {
      console.log('🔍 Validating connection...');
      
      // Use the parent health check which is now optimized
      const healthResult = await super.healthCheck(1); // Only 1 retry for validation
      
      console.log('✅ Connection validation successful');
      this.validationCache = { isValid: true, timestamp: now };
      return true;
      
    } catch (err) {
      console.log('⚠️ Direct validation failed, checking if server responds at all...');
      
      try {
        // Very simple connectivity test
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        
        await fetch(this.configuredUrl, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        // If we get any response (even 404), server is reachable
        console.log('✅ Server is reachable, caching positive result');
        this.validationCache = { isValid: true, timestamp: now };
        return true;
        
      } catch (finalErr) {
        console.error('❌ Connection validation failed completely');
        this.validationCache = { isValid: false, timestamp: now };
        throw new AutoPromtrError(
          'Cannot connect to the backend service',
          'CONNECTION_VALIDATION_FAILED',
          503,
          true
        );
      }
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run...');
    
    // Validate connection with caching
    await this.validateConnection();
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.min(options.maxRetries ?? 2, 2), // Cap retries
      ...options
    };
    
    try {
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch failed:', err);
      
      // Clear validation cache on failure
      this.validationCache = null;
      
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      throw new AutoPromtrError(
        'Enhanced batch processing failed',
        'ENHANCED_BATCH_FAILED',
        500,
        true
      );
    }
  }

  getConfiguredUrl(): string {
    return this.configuredUrl;
  }

  async getDiagnostics() {
    return await this.connectionDiagnostics.runComprehensiveTest();
  }
}
