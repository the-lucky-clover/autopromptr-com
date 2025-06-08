
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
  
  constructor(baseUrl = 'https://autopromptr-backend.onrender.com') {
    this.baseUrl = baseUrl;
  }

  async fetchHealthData(): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        status: this.determineStatus(data, responseTime),
        responseTime,
        uptime: data.uptime || 'Unknown',
        timestamp: new Date(),
        version: data.version,
        environment: data.environment,
        database: data.database,
        memory: data.memory
      };
      
    } catch (err) {
      const responseTime = Date.now() - startTime;
      
      // For CORS errors, we can still provide some metrics
      if (err instanceof Error && err.message.includes('CORS')) {
        return {
          status: 'degraded',
          responseTime,
          uptime: 'CORS Restricted',
          timestamp: new Date()
        };
      }
      
      throw err;
    }
  }

  private determineStatus(data: any, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (!data) return 'unhealthy';
    
    // Consider response time in status determination
    if (responseTime > 5000) return 'degraded';
    if (responseTime > 10000) return 'unhealthy';
    
    // Check if explicit status is provided
    if (data.status) {
      const status = data.status.toLowerCase();
      if (status === 'ok' || status === 'healthy') return 'healthy';
      if (status === 'degraded' || status === 'warning') return 'degraded';
      return 'unhealthy';
    }
    
    // Default to healthy if we got a response
    return 'healthy';
  }
}
