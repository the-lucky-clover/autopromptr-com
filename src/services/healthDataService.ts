
import { TestingService } from './testingService';

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: string;
  timestamp: Date;
  version?: string;
  environment?: string;
  database?: {
    status: string;
    responseTime?: number;
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  connectivity?: {
    isConnected: boolean;
    lastError?: string;
  };
}

export class HealthDataService {
  private baseUrl: string;
  private lastFetch: number = 0;
  private cachedData: HealthMetrics | null = null;
  private readonly CACHE_DURATION = 30000; // Reduced to 30 seconds for more accurate reporting
  private circuitBreakerOpen: boolean = false;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;
  private testingService: TestingService;
  
  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
    this.testingService = new TestingService(baseUrl);
  }

  async fetchHealthData(): Promise<HealthMetrics> {
    const now = Date.now();
    
    // Return cached data if recent
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // Check if we're on a public page - skip actual requests
    if (!window.location.pathname.includes('/dashboard')) {
      const healthData: HealthMetrics = {
        status: 'healthy',
        responseTime: 0,
        uptime: 'Ready',
        timestamp: new Date(),
        connectivity: {
          isConnected: true
        }
      };
      
      this.cachedData = healthData;
      this.lastFetch = now;
      return healthData;
    }

    // Circuit breaker pattern - don't make requests if too many failures
    if (this.circuitBreakerOpen) {
      console.log('Health service circuit breaker is open - using degraded status');
      
      const fallbackData: HealthMetrics = {
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Service Offline',
        timestamp: new Date(),
        connectivity: {
          isConnected: false,
          lastError: 'Circuit breaker active'
        }
      };
      
      this.cachedData = fallbackData;
      this.lastFetch = now;
      return fallbackData;
    }

    // Run actual health check using testing service
    try {
      const quickCheck = await this.testingService.runQuickHealthCheck();
      
      // Reset failure count on success
      if (quickCheck.isHealthy) {
        this.failureCount = 0;
        if (this.circuitBreakerOpen) {
          this.circuitBreakerOpen = false;
          console.log('Health service circuit breaker reset');
        }
      } else {
        this.failureCount++;
        
        // Open circuit breaker if too many failures
        if (this.failureCount >= this.MAX_FAILURES) {
          this.circuitBreakerOpen = true;
          console.log('Health service circuit breaker opened due to repeated failures');
        }
      }
      
      const healthData: HealthMetrics = {
        status: this.determineStatus(quickCheck.isHealthy, quickCheck.responseTime),
        responseTime: quickCheck.responseTime,
        uptime: quickCheck.isHealthy ? 'Available' : 'Unavailable',
        timestamp: new Date(),
        connectivity: {
          isConnected: quickCheck.isHealthy,
          lastError: quickCheck.error
        }
      };
      
      // Cache the result
      this.cachedData = healthData;
      this.lastFetch = now;
      
      return healthData;
      
    } catch (err) {
      // Increment failure count
      this.failureCount++;
      
      // Open circuit breaker if too many failures
      if (this.failureCount >= this.MAX_FAILURES) {
        this.circuitBreakerOpen = true;
        console.log('Health service circuit breaker opened due to repeated failures');
      }
      
      // Return accurate unhealthy status for actual failures
      const healthData: HealthMetrics = {
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Connection Failed',
        timestamp: new Date(),
        connectivity: {
          isConnected: false,
          lastError: err instanceof Error ? err.message : 'Unknown error'
        }
      };
      
      this.cachedData = healthData;
      this.lastFetch = now;
      return healthData;
    }
  }

  private determineStatus(isHealthy: boolean, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (!isHealthy) return 'unhealthy';
    
    if (responseTime > 5000) return 'degraded';
    if (responseTime > 3000) return 'degraded';
    
    return 'healthy';
  }

  // Method to get real connectivity status
  async getConnectivityStatus(): Promise<{
    isConnected: boolean;
    responseTime: number;
    error?: string;
  }> {
    try {
      const result = await this.testingService.runQuickHealthCheck();
      return {
        isConnected: result.isHealthy,
        responseTime: result.responseTime,
        error: result.error
      };
    } catch (error) {
      return {
        isConnected: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Method to manually reset circuit breaker
  resetCircuitBreaker() {
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    this.cachedData = null;
  }

  // Get circuit breaker status
  getCircuitBreakerStatus() {
    return {
      isOpen: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      maxFailures: this.MAX_FAILURES
    };
  }

  // Clear cache to force fresh data
  clearCache() {
    this.cachedData = null;
    this.lastFetch = 0;
  }
}
