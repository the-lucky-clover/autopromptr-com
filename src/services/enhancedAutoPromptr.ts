
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;

  constructor() {
    // Load configuration from localStorage with fallback
    const savedUrl = localStorage.getItem('autopromptr_backend_url') || 'https://autopromptr-backend.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    
    console.log('🔧 Enhanced AutoPromptr initialized with URL:', savedUrl);
  }

  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Validating connection to:', this.configuredUrl);
      
      // Try a direct health check first (this will work for actual backend calls)
      try {
        const healthResult = await super.healthCheck();
        console.log('✅ Direct health check successful:', healthResult);
        return true;
      } catch (healthError) {
        console.log('⚠️ Direct health check failed, running comprehensive test...');
        
        // Run comprehensive test for detailed diagnostics
        const testResult = await this.connectionDiagnostics.runComprehensiveTest();
        
        if (testResult.overallSuccess) {
          console.log('✅ Connection validation successful via comprehensive test');
          return true;
        } else {
          console.error('❌ Connection validation failed:', testResult.recommendations);
          
          // Only throw error if we have actual failures (not just CORS)
          const actualFailures = testResult.endpointResults.filter(r => !r.success && !r.corsBlocked);
          if (actualFailures.length > 0) {
            throw new AutoPromtrError(
              `Connection validation failed: ${testResult.recommendations.join(', ')}`,
              'CONNECTION_VALIDATION_FAILED',
              503,
              true
            );
          } else {
            // CORS blocks are expected, treat as success
            console.log('✅ CORS restrictions detected but this is normal - proceeding');
            return true;
          }
        }
      }
    } catch (err) {
      console.error('❌ Connection validation error:', err);
      throw err;
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with connection validation...');
    
    // First validate the connection (this will handle CORS properly)
    await this.validateConnection();
    
    // Enhanced options with better defaults
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.max(options.maxRetries ?? 3, 3),
      automationDelay: options.automationDelay ?? 2000,
      elementTimeout: options.elementTimeout ?? 15000,
      debugLevel: options.debugLevel ?? 'detailed',
      ...options
    };
    
    console.log('🔧 Enhanced options:', enhancedOptions);
    
    try {
      // Use the parent class method with validated connection
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch run completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch run failed:', err);
      
      // Enhanced error categorization
      if (err instanceof AutoPromtrError) {
        // Provide more specific error messages
        if (err.code === 'NETWORK_CONNECTION_FAILED') {
          throw new AutoPromtrError(
            'Cannot connect to the automation backend. Please check the Backend Configuration in Settings.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'REQUEST_TIMEOUT') {
          throw new AutoPromtrError(
            'Backend request timed out. The service may be under heavy load. Please try again.',
            err.code,
            err.statusCode,
            true
          );
        }
      }
      
      throw err;
    }
  }

  getConfiguredUrl(): string {
    return this.configuredUrl;
  }

  async getDiagnostics() {
    return await this.connectionDiagnostics.runComprehensiveTest();
  }
}
