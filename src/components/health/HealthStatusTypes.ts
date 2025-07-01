
export interface BackendStatus {
  name: string;
  shortName: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
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

// This should match the TestSuite from testingService.ts
export interface TestSuite {
  name: string;
  tests: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped' | 'partial';
    duration: number;
    error?: string;
    details?: any;
  }>;
  overallStatus: 'passed' | 'failed' | 'partial';
  totalDuration: number;
  passRate: number;
}

export const MAX_FAILURES = 3;
export const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
export const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes
