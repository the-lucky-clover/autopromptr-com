
import { AutoPromptr, AutoPromtrError } from './autoPromptr';

export interface ConnectionTestResult {
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
  details?: any;
}

export interface NetworkEnvironment {
  hasAdBlocker: boolean;
  hasCorsIssues: boolean;
  networkType: string;
  isOnline: boolean;
}

export class ConnectionDiagnostics {
  private baseUrl: string;
  
  constructor(baseUrl?: string) {
    // Load from localStorage or use default
    this.baseUrl = baseUrl || 
      localStorage.getItem('autopromptr_backend_url') || 
      'https://autopromptr-backend.onrender.com';
  }

  async testAllEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      '/health',
      '/api/platforms',
      '/api/batch-status/test'
    ];

    const results: ConnectionTestResult[] = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testSingleEndpoint(endpoint);
      results.push(result);
    }
    
    return results;
  }

  async testSingleEndpoint(endpoint: string): Promise<ConnectionTestResult> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          endpoint: fullUrl,
          success: true,
          responseTime,
          details: data
        };
      } else {
        return {
          endpoint: fullUrl,
          success: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (err) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: fullUrl,
        success: false,
        responseTime,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }

  async detectNetworkEnvironment(): Promise<NetworkEnvironment> {
    return {
      hasAdBlocker: await this.detectAdBlocker(),
      hasCorsIssues: await this.detectCorsIssues(),
      networkType: this.getNetworkType(),
      isOnline: navigator.onLine
    };
  }

  private async detectAdBlocker(): Promise<boolean> {
    try {
      const testUrl = 'https://googleads.g.doubleclick.net/pagead/id';
      await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      return false;
    } catch {
      return true;
    }
  }

  private async detectCorsIssues(): Promise<boolean> {
    try {
      await fetch(`${this.baseUrl}/health`, { method: 'HEAD' });
      return false;
    } catch (err) {
      return err instanceof Error && err.message.includes('CORS');
    }
  }

  private getNetworkType(): string {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  async runComprehensiveTest(): Promise<{
    overallSuccess: boolean;
    configuredUrl: string;
    endpointResults: ConnectionTestResult[];
    networkEnvironment: NetworkEnvironment;
    recommendations: string[];
  }> {
    const endpointResults = await this.testAllEndpoints();
    const networkEnvironment = await this.detectNetworkEnvironment();
    const recommendations: string[] = [];
    
    const successfulTests = endpointResults.filter(r => r.success);
    const overallSuccess = successfulTests.length > 0;
    
    // Generate recommendations
    if (!overallSuccess) {
      recommendations.push('Backend service appears to be unreachable');
      if (!networkEnvironment.isOnline) {
        recommendations.push('Check your internet connection');
      }
      if (networkEnvironment.hasAdBlocker) {
        recommendations.push('Ad blocker detected - may be blocking requests');
      }
      if (networkEnvironment.hasCorsIssues) {
        recommendations.push('CORS issues detected - check backend configuration');
      }
    } else if (successfulTests.length < endpointResults.length) {
      recommendations.push('Some endpoints are failing - partial connectivity');
    }
    
    return {
      overallSuccess,
      configuredUrl: this.baseUrl,
      endpointResults,
      networkEnvironment,
      recommendations
    };
  }
}
