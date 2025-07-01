
import { HealthMonitorService, HealthStatus } from './healthMonitorService';

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
  private healthMonitor = HealthMonitorService.getInstance();
  private cachedData: HealthMetrics | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 120000; // 2 minutes
  
  constructor() {
    // Subscribe to health monitor updates
    this.healthMonitor.subscribe((status: HealthStatus) => {
      this.cachedData = this.convertToHealthMetrics(status);
      this.lastFetch = Date.now();
    });
  }

  private convertToHealthMetrics(status: HealthStatus): HealthMetrics {
    return {
      status: status.status === 'unknown' ? 'unhealthy' : status.status,
      responseTime: status.responseTime,
      uptime: status.uptime,
      timestamp: status.lastChecked,
      connectivity: {
        isConnected: status.isConnected,
        lastError: status.error
      }
    };
  }

  async fetchHealthData(): Promise<HealthMetrics> {
    const now = Date.now();
    
    // Return cached data if recent
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // Skip if not on dashboard pages
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

    // Use the global health monitor instead of making direct requests
    const currentStatus = this.healthMonitor.getCurrentStatus();
    const healthData = this.convertToHealthMetrics(currentStatus);
    
    this.cachedData = healthData;
    this.lastFetch = now;
    
    return healthData;
  }

  // Method to get real connectivity status
  async getConnectivityStatus(): Promise<{
    isConnected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const status = this.healthMonitor.getCurrentStatus();
    return {
      isConnected: status.isConnected,
      responseTime: status.responseTime,
      error: status.error
    };
  }

  // Method to manually reset circuit breaker
  resetCircuitBreaker() {
    this.healthMonitor.resetCircuitBreaker();
    console.log('HealthDataService: Circuit breaker manually reset');
  }

  // Clear cache to force fresh data
  clearCache() {
    this.cachedData = null;
    this.lastFetch = 0;
  }

  // Perform manual health check
  async performManualCheck(): Promise<HealthMetrics> {
    const status = await this.healthMonitor.manualCheck();
    return this.convertToHealthMetrics(status);
  }
}
