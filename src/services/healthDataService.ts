
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
  private readonly CACHE_DURATION = 120000; // Increased to 2 minutes
  private circuitBreakerOpen: boolean = false;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;
  private lastFailureTime: number = 0;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
  private testingService: TestingService;
  
  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
    this.testingService = new TestingService(baseUrl);
  }

  private shouldSkipHealthCheck(): boolean {
    // Skip if not on dashboard pages
    if (!window.location.pathname.includes('/dashboard')) {
      console.log('HealthDataService: Skipping - not on dashboard');
      return true;
    }

    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.CIRCUIT_BREAKER_TIMEOUT) {
        console.log('HealthDataService: Circuit breaker reset after timeout');
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        return false;
      }
      console.log('HealthDataService: Circuit breaker is open - skipping');
      return true;
    }

    return false;
  }

  async fetchHealthData(): Promise<HealthMetrics> {
    const now = Date.now();
    
    // Return cached data if recent
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // Skip if conditions aren't right
    if (this.shouldSkipHealthCheck()) {
      // Return fallback data for non-dashboard pages
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

      // Circuit breaker fallback
      const fallbackData: HealthMetrics = {
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Service Protection Active',
        timestamp: new Date(),
        connectivity: {
          isConnected: false,
          lastError: 'Circuit breaker protection active'
        }
      };
      
      this.cachedData = fallbackData;
      this.lastFetch = now;
      return fallbackData;
    }

    // Run actual health check
    try {
      console.log('HealthDataService: Running health check');
      const quickCheck = await this.testingService.runQuickHealthCheck();
      
      // Reset failure count on success
      if (quickCheck.isHealthy) {
        this.failureCount = 0;
        if (this.circuitBreakerOpen) {
          this.circuitBreakerOpen = false;
          console.log('HealthDataService: Circuit breaker reset on success');
        }
      } else {
        this.handleFailure();
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
      
      this.cachedData = healthData;
      this.lastFetch = now;
      
      return healthData;
      
    } catch (err) {
      this.handleFailure();
      
      const healthData: HealthMetrics = {
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Connection Failed',
        timestamp: new Date(),
        connectivity: {
          isConnected: false,
          lastError: err instanceof Error ? err.message : 'Service temporarily unavailable'
        }
      };
      
      this.cachedData = healthData;
      this.lastFetch = now;
      return healthData;
    }
  }

  private handleFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.MAX_FAILURES) {
      this.circuitBreakerOpen = true;
      console.log(`HealthDataService: Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  private determineStatus(isHealthy: boolean, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (!isHealthy) return 'unhealthy';
    
    if (responseTime > 8000) return 'degraded';
    if (responseTime > 5000) return 'degraded';
    
    return 'healthy';
  }

  // Method to get real connectivity status
  async getConnectivityStatus(): Promise<{
    isConnected: boolean;
    responseTime: number;
    error?: string;
  }> {
    if (this.shouldSkipHealthCheck()) {
      return {
        isConnected: false,
        responseTime: 0,
        error: 'Health checks disabled'
      };
    }

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
    this.lastFailureTime = 0;
    console.log('HealthDataService: Circuit breaker manually reset');
  }

  // Get circuit breaker status
  getCircuitBreakerStatus() {
    return {
      isOpen: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      maxFailures: this.MAX_FAILURES,
      lastFailureTime: this.lastFailureTime
    };
  }

  // Clear cache to force fresh data
  clearCache() {
    this.cachedData = null;
    this.lastFetch = 0;
  }
}
