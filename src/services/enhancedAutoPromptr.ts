
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;

  constructor() {
    // Use your working Puppeteer backend URL
    const savedUrl = 'https://puppeteer-backend-da0o.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    
    console.log('🔧 Enhanced AutoPromptr initialized with Puppeteer backend URL:', savedUrl);
  }

  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Validating connection to Puppeteer backend:', this.configuredUrl);
      
      try {
        const healthResult = await super.healthCheck();
        console.log('✅ Direct health check successful:', healthResult);
        return true;
      } catch (healthError) {
        console.log('⚠️ Direct health check failed, running comprehensive test...');
        
        const testResult = await this.connectionDiagnostics.runComprehensiveTest();
        
        if (testResult.overallSuccess) {
          console.log('✅ Connection validation successful via comprehensive test');
          return true;
        } else {
          console.error('❌ Connection validation failed:', testResult.recommendations);
          
          const actualFailures = testResult.endpointResults.filter(r => !r.success && !r.corsBlocked);
          if (actualFailures.length > 0) {
            throw new AutoPromtrError(
              `Connection validation failed: ${testResult.recommendations.join(', ')}`,
              'CONNECTION_VALIDATION_FAILED',
              503,
              true
            );
          } else {
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
    console.log('🚀 Starting enhanced batch run with Puppeteer backend validation...');
    
    await this.validateConnection();
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.max(options.maxRetries ?? 3, 3),
      automationDelay: options.automationDelay ?? 2000,
      elementTimeout: options.elementTimeout ?? 15000,
      debugLevel: options.debugLevel ?? 'detailed',
      ...options
    };
    
    console.log('🔧 Enhanced options for Puppeteer backend:', enhancedOptions);
    
    try {
      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch run completed successfully with Puppeteer backend');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch run failed:', err);
      
      if (err instanceof AutoPromtrError) {
        if (err.code === 'NETWORK_CONNECTION_FAILED') {
          throw new AutoPromtrError(
            'Cannot connect to the Puppeteer backend. Please check if the service is running.',
            err.code,
            err.statusCode,
            true
          );
        }
        
        if (err.code === 'REQUEST_TIMEOUT') {
          throw new AutoPromtrError(
            'Puppeteer backend request timed out. The service may be under heavy load.',
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
