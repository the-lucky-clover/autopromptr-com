
export interface BackendStatus {
  name: string;
  shortName: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: string;
  lastChecked: Date;
  icon: string;
  isConnected: boolean;
}

export interface HealthStatusDashboardProps {
  isCompact?: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  isOpen: boolean;
  lastFailure: number;
}

export const MAX_FAILURES = 3;
export const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
export const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes
