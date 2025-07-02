
import { AutoPromptr, AutoPromtprError } from './autoPromptr';

export class ConnectionDiagnostics {
  private baseUrl: string;
  private autoPromptr: AutoPromptr;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.autoPromptr = new AutoPromptr(baseUrl);
  }

  async runComprehensiveTest() {
    console.log('🔍 Starting comprehensive connection diagnostics...');
    
    const results = {
      overallSuccess: false,
      configuredUrl: this.baseUrl,
      endpointResults: [] as any[],
      networkEnvironment: {
        hasAdBlocker: false,
        hasCorsIssues: false,
        networkType: 'unknown',
        isOnline: navigator.onLine
      }
    };

    // Test health endpoint
    try {
      const healthResult = await this.testHealthEndpoint();
      results.endpointResults.push(healthResult);
      
      if (healthResult.success) {
        results.overallSuccess = true;
      }
    } catch (error) {
      console.error('Health endpoint test failed:', error);
      results.endpointResults.push({
        endpoint: '/health',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: 0
      });
    }

    // Network environment detection
    results.networkEnvironment = await this.detectNetworkEnvironment();

    console.log('📊 Diagnostics complete:', results);
    return results;
  }

  private async testHealthEndpoint() {
    const startTime = Date.now();
    
    try {
      await this.autoPromptr.healthCheck();
      
      return {
        endpoint: '/health',
        success: true,
        latency: Date.now() - startTime,
        error: null
      };
    } catch (error) {
      return {
        endpoint: '/health',
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof AutoPromtprError ? error.message : 'Unknown error'
      };
    }
  }

  private async detectNetworkEnvironment() {
    // Basic network environment detection
    return {
      hasAdBlocker: false, // Could be enhanced with actual detection
      hasCorsIssues: false, // Would be detected from failed requests
      networkType: (navigator as any).connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine
    };
  }
}
