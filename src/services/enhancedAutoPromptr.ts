import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { RedundantAutoPromptr } from './redundantAutoPromptr';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;
  private redundantSystem: RedundantAutoPromptr;
  private validationCache: { isValid: boolean; timestamp: number } | null = null;
  private readonly VALIDATION_CACHE_DURATION = 60000; // 1 minute cache

  constructor() {
    const savedUrl = 'https://puppeteer-backend-da0o.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    this.redundantSystem = new RedundantAutoPromptr();
    
    console.log('🔧 Enhanced AutoPromptr initialized with redundant failover system');
  }

  async validateConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached validation if recent
    if (this.validationCache && (now - this.validationCache.timestamp) < this.VALIDATION_CACHE_DURATION) {
      console.log('Using cached validation result:', this.validationCache.isValid);
      return this.validationCache.isValid;
    }

    try {
      console.log('🔍 Validating redundant connections...');
      
      const connectionStatus = await this.redundantSystem.validateConnections();
      
      // Consider connection valid if either backend is working
      const isValid = connectionStatus.primary || connectionStatus.fallback;
      
      console.log('✅ Redundant connection validation result:', {
        primary: connectionStatus.primary,
        fallback: connectionStatus.fallback,
        overall: isValid,
        recommendation: connectionStatus.recommendation
      });
      
      this.validationCache = { isValid, timestamp: now };
      return isValid;
      
    } catch (err) {
      console.error('❌ Redundant connection validation failed completely');
      this.validationCache = { isValid: false, timestamp: now };
      throw new AutoPromtrError(
        'Cannot connect to any backend service',
        'REDUNDANT_CONNECTION_VALIDATION_FAILED',
        503,
        true
      );
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with redundant failover...');
    
    // Validate connections with redundancy
    await this.validateConnection();
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.min(options.maxRetries ?? 2, 2), // This is per-backend
      ...options
    };
    
    try {
      const result = await this.redundantSystem.runBatchWithRedundancy(batch, platform, enhancedOptions);
      console.log('✅ Enhanced redundant batch completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced redundant batch failed:', err);
      
      // Clear validation cache on failure
      this.validationCache = null;
      
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      throw new AutoPromtrError(
        'Enhanced redundant batch processing failed',
        'ENHANCED_REDUNDANT_BATCH_FAILED',
        500,
        true
      );
    }
  }

  getConfiguredUrl(): string {
    return this.configuredUrl;
  }

  async getDiagnostics() {
    const standardDiagnostics = await this.connectionDiagnostics.runComprehensiveTest();
    const redundantStatus = await this.redundantSystem.validateConnections();
    const backendConfig = this.redundantSystem.getBackendConfiguration();
    
    return {
      ...standardDiagnostics,
      redundancy: {
        primary: redundantStatus.primary,
        fallback: redundantStatus.fallback,
        recommendation: redundantStatus.recommendation,
        configuration: backendConfig
      }
    };
  }

  getRedundancyStatus() {
    return this.redundantSystem.getBackendConfiguration();
  }
}
