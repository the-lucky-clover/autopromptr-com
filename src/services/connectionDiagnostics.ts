import { AutoPromptr } from './autoPromptr';
import { AutoPromptrError } from './autoPromptr';
import { API_BASE_URL } from './autoPromptr/config';

export interface ConnectionTestResult {
  endpoint: string;
  success: boolean;
  error?: string;
  latency: number;
  corsBlocked?: boolean;
  responseTime?: number;
}

export class ConnectionDiagnostics {
  private autoPromptr: AutoPromptr;

  constructor() {
    this.autoPromptr = new AutoPromptr(API_BASE_URL);
  }

  async testConnection(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity by trying to get platforms
      await this.autoPromptr.getPlatforms();
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        latency
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof AutoPromptrError ? error.message : 'Connection failed'
      };
    }
  }

  async runComprehensiveTest() {
    console.log('🔍 Starting comprehensive connection diagnostics...');
    
    const results = {
      overallSuccess: false,
      configuredUrl: this.autoPromptr.baseUrl,
      endpointResults: [] as ConnectionTestResult[],
      networkEnvironment: {
        hasAdBlocker: false,
        hasCorsIssues: false,
        networkType: 'unknown',
        isOnline: navigator.onLine
      },
      recommendations: [] as string[]
    };

    // Test health endpoint
    try {
      const healthResult = await this.testHealthEndpoint();
      results.endpointResults.push(healthResult);
      
      if (healthResult.success) {
        results.overallSuccess = true;
        results.recommendations.push('Backend connection is healthy and ready for automation');
      } else {
        results.recommendations.push('Backend connection issues detected - check network connectivity');
      }
    } catch (error) {
      console.error('Health endpoint test failed:', error);
      results.endpointResults.push({
        endpoint: '/health',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: 0,
        responseTime: 0
      });
      results.recommendations.push('Unable to reach backend - service may be offline');
    }

    // Network environment detection
    results.networkEnvironment = await this.detectNetworkEnvironment();

    if (results.networkEnvironment.hasCorsIssues) {
      results.recommendations.push('CORS restrictions detected - this is normal for browser security');
    }

    console.log('📊 Diagnostics complete:', results);
    return results;
  }

  private async testHealthEndpoint(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      await this.autoPromptr.healthCheck();
      
      return {
        endpoint: '/health',
        success: true,
        latency: Date.now() - startTime,
        responseTime: Date.now() - startTime,
        error: undefined
      };
    } catch (error) {
      return {
        endpoint: '/health',
        success: false,
        latency: Date.now() - startTime,
        responseTime: Date.now() - startTime,
        error: error instanceof AutoPromptrError ? error.message : 'Unknown error'
      };
    }
  }

  private async detectNetworkEnvironment() {
    // Basic network environment detection
    return {
      hasAdBlocker: false,
      hasCorsIssues: false,
      networkType: (navigator as any).connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine
    };
  }
}
