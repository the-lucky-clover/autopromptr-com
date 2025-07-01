
import { GlobalCircuitBreaker } from './globalCircuitBreaker';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  uptime: string;
  lastChecked: Date;
  isConnected: boolean;
  error?: string;
  circuitBreakerState?: any;
}

export class HealthMonitorService {
  private static instance: HealthMonitorService;
  private circuitBreaker = GlobalCircuitBreaker.getInstance();
  private subscribers: ((status: HealthStatus) => void)[] = [];
  private currentStatus: HealthStatus = {
    status: 'unknown',
    responseTime: 0,
    uptime: 'Not checked',
    lastChecked: new Date(),
    isConnected: false
  };
  
  private checkInterval: NodeJS.Timeout | null = null;
  private isVisible = true;

  static getInstance(): HealthMonitorService {
    if (!HealthMonitorService.instance) {
      HealthMonitorService.instance = new HealthMonitorService();
    }
    return HealthMonitorService.instance;
  }

  constructor() {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        console.log('📡 Page visible - resuming health monitoring');
        this.performSingleCheck();
      } else {
        console.log('🛑 Page hidden - pausing health monitoring');
        this.stopMonitoring();
      }
    });
  }

  subscribe(callback: (status: HealthStatus) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately provide current status
    callback(this.currentStatus);
    
    // Start monitoring if this is the first subscriber
    if (this.subscribers.length === 1) {
      this.startMonitoring();
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
      
      // Stop monitoring if no subscribers
      if (this.subscribers.length === 0) {
        this.stopMonitoring();
      }
    };
  }

  private notifySubscribers(status: HealthStatus): void {
    this.currentStatus = status;
    this.subscribers.forEach(callback => callback(status));
  }

  private startMonitoring(): void {
    if (!this.isVisible) {
      console.log('🛑 Skipping monitoring start - page not visible');
      return;
    }

    this.stopMonitoring();
    
    // Perform initial check after 3 seconds
    setTimeout(() => {
      if (this.isVisible) {
        this.performSingleCheck();
      }
    }, 3000);
    
    // Set up periodic checks based on circuit breaker state
    this.scheduleNextCheck();
  }

  private stopMonitoring(): void {
    if (this.checkInterval) {
      clearTimeout(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private scheduleNextCheck(): void {
    if (!this.isVisible) return;
    
    const circuitState = this.circuitBreaker.getState();
    let interval: number;
    
    // Determine check interval based on state
    if (circuitState.status === 'grace_period') {
      interval = 300000; // 5 minutes during grace period
    } else if (circuitState.status === 'circuit_open') {
      interval = Math.max(circuitState.nextRetryIn, 300000); // At least 5 minutes
    } else if (circuitState.status === 'healthy') {
      interval = 300000; // 5 minutes when healthy
    } else {
      interval = 600000; // 10 minutes when degraded
    }
    
    this.checkInterval = setTimeout(() => {
      if (this.isVisible) {
        this.performSingleCheck();
        this.scheduleNextCheck();
      }
    }, interval);
    
    console.log(`⏰ Next health check scheduled in ${interval / 1000}s`);
  }

  async performSingleCheck(): Promise<HealthStatus> {
    try {
      const status = await this.circuitBreaker.makeRequest(() => this.checkHealth());
      this.notifySubscribers(status);
      return status;
    } catch (error) {
      const errorStatus: HealthStatus = {
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Connection failed',
        lastChecked: new Date(),
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        circuitBreakerState: this.circuitBreaker.getState()
      };
      
      this.notifySubscribers(errorStatus);
      return errorStatus;
    }
  }

  private async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    const response = await fetch('https://autopromptr-backend.onrender.com/health', {
      method: 'HEAD',
      headers: { 'Accept': 'application/json' }
    });
    
    const responseTime = Date.now() - startTime;
    const isConnected = response.ok || response.status < 500;
    
    return {
      status: isConnected ? (responseTime > 5000 ? 'degraded' : 'healthy') : 'unhealthy',
      responseTime,
      uptime: isConnected ? 'Connected' : 'Disconnected',
      lastChecked: new Date(),
      isConnected,
      circuitBreakerState: this.circuitBreaker.getState()
    };
  }

  getCurrentStatus(): HealthStatus {
    return this.currentStatus;
  }

  async manualCheck(): Promise<HealthStatus> {
    console.log('🔄 Manual health check requested');
    return this.performSingleCheck();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
    this.performSingleCheck();
  }
}
