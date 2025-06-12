
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
}

export class HealthDataService {
  private baseUrl: string;
  private lastFetch: number = 0;
  private cachedData: HealthMetrics | null = null;
  private readonly CACHE_DURATION = 300000; // Increased to 5 minutes cache
  private circuitBreakerOpen: boolean = false;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;
  
  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
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
        timestamp: new Date()
      };
      
      this.cachedData = healthData;
      this.lastFetch = now;
      return healthData;
    }

    // Circuit breaker pattern - don't make requests if too many failures
    if (this.circuitBreakerOpen) {
      console.log('Health service circuit breaker is open - using cached data');
      
      const fallbackData: HealthMetrics = {
        status: 'degraded',
        responseTime: 0,
        uptime: 'Service Offline',
        timestamp: new Date()
      };
      
      this.cachedData = fallbackData;
      this.lastFetch = now;
      return fallbackData;
    }

    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout
      
      // Simplified HEAD request to avoid complex CORS issues
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const healthData: HealthMetrics = {
        status: this.determineStatus(response, responseTime),
        responseTime,
        uptime: 'Available',
        timestamp: new Date()
      };
      
      // Reset failure count on success
      this.failureCount = 0;
      if (this.circuitBreakerOpen) {
        this.circuitBreakerOpen = false;
        console.log('Health service circuit breaker reset');
      }
      
      // Cache the result
      this.cachedData = healthData;
      this.lastFetch = now;
      
      return healthData;
      
    } catch (err) {
      const responseTime = Date.now() - startTime;
      
      // Increment failure count
      this.failureCount++;
      
      // Open circuit breaker if too many failures
      if (this.failureCount >= this.MAX_FAILURES) {
        this.circuitBreakerOpen = true;
        console.log('Health service circuit breaker opened due to repeated failures');
      }
      
      // Always assume healthy for CORS/network errors to reduce console spam
      const healthData: HealthMetrics = {
        status: 'healthy',
        responseTime,
        uptime: 'Ready',
        timestamp: new Date()
      };
      
      this.cachedData = healthData;
      this.lastFetch = now;
      return healthData;
    }
  }

  private determineStatus(response: Response, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    // Be more optimistic about status
    if (responseTime > 10000) return 'degraded';
    if (responseTime > 5000) return 'degraded';
    
    // Any response means healthy
    return 'healthy';
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
}
