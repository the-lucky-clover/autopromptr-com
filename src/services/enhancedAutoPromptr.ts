
import { AutoPromptr, AutoPromptprError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { RedundantAutoPromptr } from './redundantAutoPromptr';
import { GlobalCircuitBreaker } from './globalCircuitBreaker';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;
  private simplifiedSystem: RedundantAutoPromptr;
  private globalCircuitBreaker = GlobalCircuitBreaker.getInstance();

  constructor() {
    const savedUrl = 'https://autopromptr-backend.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    this.simplifiedSystem = new RedundantAutoPromptr();
    
    console.log('🔧 Enhanced AutoPromptr initialized with global circuit breaker protection');
  }

  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔍 Performing connection validation with global circuit breaker...');
      
      const result = await this.globalCircuitBreaker.makeRequest(async () => {
        const connectionStatus = await this.simplifiedSystem.validateConnections();
        return connectionStatus.primary || false;
      });
      
      console.log('✅ Enhanced validation result:', result);
      return result;
      
    } catch (err) {
      console.log('❌ Validation blocked by circuit breaker:', err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with circuit breaker protection...');
    
    // Check if we can make requests
    const canRequest = this.globalCircuitBreaker.canMakeRequest();
    if (!canRequest.allowed) {
      throw new AutoPromptprError(
        `Backend services are temporarily unavailable: ${canRequest.reason}`,
        'CIRCUIT_BREAKER_OPEN',
        503,
        true
      );
    }
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: 1, // Reduced retries
      timeout: 30000,
      ...options
    };
    
    try {
      console.log('🎯 Starting batch with circuit breaker protection:', enhancedOptions);
      
      const result = await this.globalCircuitBreaker.makeRequest(async () => {
        return await this.simplifiedSystem.runBatchWithRedundancy(batch, platform, enhancedOptions);
      });
      
      console.log('✅ Enhanced batch completed successfully');
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch failed:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Circuit breaker')) {
          throw new AutoPromptprError(
            'Backend services are temporarily unavailable due to circuit breaker protection.',
            'CIRCUIT_BREAKER_OPEN',
            503,
            true
          );
        }
      }
      
      if (err instanceof AutoPromptprError) {
        throw err;
      }
      
      throw new AutoPromptprError(
        'Enhanced batch processing failed due to an unexpected error',
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
    const circuitBreakerState = this.globalCircuitBreaker.getState();
    
    // Return circuit breaker status without making requests if blocked
    if (!this.globalCircuitBreaker.canMakeRequest().allowed) {
      return {
        overallSuccess: false,
        configuredUrl: this.configuredUrl,
        endpointResults: [],
        networkEnvironment: {
          hasAdBlocker: false,
          hasCorsIssues: true,
          networkType: 'unknown',
          isOnline: navigator.onLine
        },
        globalCircuitBreaker: circuitBreakerState,
        simplifiedMode: {
          primary: false,
          recommendation: 'Service temporarily unavailable - global circuit breaker active',
          configuration: this.simplifiedSystem.getBackendConfiguration()
        }
      };
    }

    try {
      const standardDiagnostics = await this.connectionDiagnostics.runComprehensiveTest();
      const backendStatus = await this.simplifiedSystem.validateConnections();
      const backendConfig = this.simplifiedSystem.getBackendConfiguration();
      
      return {
        ...standardDiagnostics,
        globalCircuitBreaker: circuitBreakerState,
        simplifiedMode: {
          primary: backendStatus.primary,
          recommendation: backendStatus.recommendation,
          configuration: backendConfig
        }
      };
    } catch (err) {
      return {
        overallSuccess: false,
        configuredUrl: this.configuredUrl,
        endpointResults: [],
        networkEnvironment: {
          hasAdBlocker: false,
          hasCorsIssues: true,
          networkType: 'unknown',
          isOnline: navigator.onLine
        },
        globalCircuitBreaker: circuitBreakerState,
        simplifiedMode: {
          primary: false,
          recommendation: 'Enhanced diagnostics failed - operating with global circuit breaker protection',
          configuration: this.simplifiedSystem.getBackendConfiguration()
        }
      };
    }
  }

  getSimplifiedStatus() {
    return {
      ...this.simplifiedSystem.getBackendConfiguration(),
      globalCircuitBreaker: this.globalCircuitBreaker.getState()
    };
  }

  // Method to reset circuit breakers
  resetCircuitBreakers() {
    this.globalCircuitBreaker.reset();
    console.log('Enhanced AutoPromptr: Global circuit breaker manually reset');
  }

  // Get circuit breaker status
  getCircuitBreakerStatus() {
    return this.globalCircuitBreaker.getState();
  }
}
