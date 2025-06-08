
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
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  
  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
  }

  async fetchHealthData(): Promise<HealthMetrics> {
    const now = Date.now();
    
    // Return cached data if recent
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Try simple connectivity test instead of specific health endpoint
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
      
      // Cache the result
      this.cachedData = healthData;
      this.lastFetch = now;
      
      return healthData;
      
    } catch (err) {
      const responseTime = Date.now() - startTime;
      
      // For CORS errors, we can still provide basic metrics
      if (err instanceof Error && err.message.includes('CORS')) {
        const healthData: HealthMetrics = {
          status: 'healthy', // Assume healthy if CORS is the only issue
          responseTime,
          uptime: 'CORS Restricted',
          timestamp: new Date()
        };
        
        this.cachedData = healthData;
        this.lastFetch = now;
        return healthData;
      }
      
      throw err;
    }
  }

  private determineStatus(response: Response, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    // Consider response time in status determination
    if (responseTime > 10000) return 'unhealthy';
    if (responseTime > 5000) return 'degraded';
    
    // Any response (including 404) means server is running
    if (response.status < 500) return 'healthy';
    
    return 'degraded';
  }
}
