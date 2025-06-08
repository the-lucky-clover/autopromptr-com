
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
    this.baseUrl = baseUrl || 'https://puppeteer-backend-da0o.onrender.com';
  }

  async testSingleEndpoint(endpoint: string): Promise<ConnectionTestResult> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout
      
      // Use GET instead of POST to reduce server load
      const response = await fetch(fullUrl, {
        method: 'HEAD', // Even lighter than GET
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Any response code means server is responding
      return {
        endpoint: fullUrl,
        success: response.status < 500, // Server errors are failures
        responseTime,
        details: { status: response.status }
      };
      
    } catch (err) {
      const responseTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      const isCorsError = errorMessage.includes('CORS') || 
                         errorMessage.includes('Access-Control-Allow-Origin');
      
      return {
        endpoint: fullUrl,
        success: false,
        responseTime,
        error: isCorsError ? 'CORS restriction (normal in browser)' : errorMessage,
        corsBlocked: isCorsError
      };
    }
  }

  async detectNetworkEnvironment(): Promise<NetworkEnvironment> {
    return {
      hasAdBlocker: false, // Skip ad blocker detection to reduce requests
      hasCorsIssues: false, // We expect CORS issues
      networkType: this.getNetworkType(),
      isOnline: navigator.onLine
    };
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
    // Test only essential endpoints to reduce load
    const endpoints = ['/api/run-puppeteer'];
    const endpointResults: ConnectionTestResult[] = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testSingleEndpoint(endpoint);
      endpointResults.push(result);
    }
    
    const networkEnvironment = await this.detectNetworkEnvironment();
    const recommendations: string[] = [];
    
    const successfulTests = endpointResults.filter(r => r.success);
    const corsBlockedTests = endpointResults.filter(r => r.corsBlocked);
    
    const overallSuccess = successfulTests.length > 0 || corsBlockedTests.length > 0;
    
    if (!overallSuccess) {
      recommendations.push('Backend service appears to be unreachable');
      if (!networkEnvironment.isOnline) {
        recommendations.push('Check your internet connection');
      }
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
