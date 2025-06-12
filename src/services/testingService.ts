import { ConnectionDiagnostics } from './connectionDiagnostics';

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'partial';
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  totalDuration: number;
  passRate: number;
}

export class TestingService {
  private baseUrl: string;
  private diagnostics: ConnectionDiagnostics;

  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
    this.diagnostics = new ConnectionDiagnostics(baseUrl);
  }

  async runTestSuite(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    console.log('🧪 Starting comprehensive test suite for autopromptr-backend...');

    // Test 1: Basic connectivity
    tests.push(await this.testBasicConnectivity());

    // Test 2: Health endpoint
    tests.push(await this.testHealthEndpoint());

    // Test 3: Test endpoint (new)
    tests.push(await this.testTestEndpoint());

    // Test 4: API endpoints
    tests.push(await this.testAPIEndpoints());

    // Test 5: Response times
    tests.push(await this.testResponseTimes());

    // Test 6: Error handling
    tests.push(await this.testErrorHandling());

    const totalDuration = Date.now() - startTime;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const passRate = (passedTests / tests.length) * 100;

    const overallStatus = passRate === 100 ? 'passed' : 
                         passRate >= 50 ? 'partial' : 'failed';

    return {
      name: 'AutoPromptr Backend Test Suite',
      tests,
      overallStatus,
      totalDuration,
      passRate
    };
  }

  private async testBasicConnectivity(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      return {
        name: 'Basic Connectivity',
        status: 'passed',
        duration,
        details: { 
          status: response.status,
          responseTime: duration
        }
      };
    } catch (error) {
      return {
        name: 'Basic Connectivity',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testHealthEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Health Endpoint',
          status: 'passed',
          duration,
          details: data
        };
      } else {
        return {
          name: 'Health Endpoint',
          status: 'failed',
          duration,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: 'Health Endpoint',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testTestEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Test Endpoint',
          status: 'passed',
          duration,
          details: data
        };
      } else {
        return {
          name: 'Test Endpoint',
          status: 'failed',
          duration,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        name: 'Test Endpoint',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAPIEndpoints(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const endpoints = ['/api/run-batch'];
      let allPassed = true;
      const details: any = {};
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          details[endpoint] = {
            status: response.status,
            accessible: true
          };
        } catch (error) {
          details[endpoint] = {
            accessible: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          allPassed = false;
        }
      }
      
      return {
        name: 'API Endpoints',
        status: allPassed ? 'passed' : 'partial',
        duration: Date.now() - startTime,
        details
      };
    } catch (error) {
      return {
        name: 'API Endpoints',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testResponseTimes(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const times: number[] = [];
      const attempts = 3;
      
      for (let i = 0; i < attempts; i++) {
        const requestStart = Date.now();
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          await fetch(this.baseUrl, {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          times.push(Date.now() - requestStart);
        } catch {
          times.push(5000); // Timeout value
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxResponseTime = Math.max(...times);
      
      const status = avgResponseTime < 3000 ? 'passed' : 
                    avgResponseTime < 5000 ? 'partial' : 'failed';
      
      return {
        name: 'Response Times',
        status,
        duration: Date.now() - startTime,
        details: {
          averageResponseTime: avgResponseTime,
          maxResponseTime,
          allTimes: times
        }
      };
    } catch (error) {
      return {
        name: 'Response Times',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testErrorHandling(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test invalid endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/invalid-endpoint-test-123`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // We expect a 404 or similar error response
      const status = response.status === 404 ? 'passed' : 'partial';
      
      return {
        name: 'Error Handling',
        status,
        duration: Date.now() - startTime,
        details: {
          expectedError: true,
          actualStatus: response.status,
          handledCorrectly: response.status >= 400
        }
      };
    } catch (error) {
      return {
        name: 'Error Handling',
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runQuickHealthCheck(): Promise<{
    isHealthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        isHealthy: true,
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
