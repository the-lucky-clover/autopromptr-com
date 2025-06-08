import { AutoPromptr, AutoPromtrError } from './autoPromptr';

export interface ConnectionTestResult {
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
  details?: any;
  corsBlocked?: boolean;
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
    // Use your working Puppeteer backend
    this.baseUrl = baseUrl || 'https://puppeteer-backend-da0o.onrender.com';
  }

  async testAllEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      '/api/run-puppeteer'
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com',
          prompt: 'test connection'
        }),
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      const isCorsError = errorMessage.includes('CORS') || 
                         errorMessage.includes('Access-Control-Allow-Origin') ||
                         errorMessage.includes('preflight');
      
      return {
        endpoint: fullUrl,
        success: false,
        responseTime,
        error: isCorsError ? 'CORS restriction (expected in browser)' : errorMessage,
        corsBlocked: isCorsError
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
      await fetch(`${this.baseUrl}/api/run-puppeteer`, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      return errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin');
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
    const corsBlockedTests = endpointResults.filter(r => r.corsBlocked);
    const actualFailures = endpointResults.filter(r => !r.success && !r.corsBlocked);
    
    const overallSuccess = successfulTests.length > 0 || 
                          (corsBlockedTests.length > 0 && actualFailures.length === 0);
    
    if (!overallSuccess && actualFailures.length > 0) {
      recommendations.push('Puppeteer backend service appears to be unreachable');
      if (!networkEnvironment.isOnline) {
        recommendations.push('Check your internet connection');
      }
    } else if (corsBlockedTests.length > 0 && successfulTests.length === 0) {
      recommendations.push('CORS restrictions detected - this is normal for browser security');
      recommendations.push('Backend connectivity will be tested during actual batch runs');
    }
    
    if (networkEnvironment.hasAdBlocker && actualFailures.length > 0) {
      recommendations.push('Ad blocker may be interfering with requests');
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
