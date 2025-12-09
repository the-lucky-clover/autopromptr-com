import { useState, useEffect } from 'react';
import { cloudflare } from '@/integrations/cloudflare/client';

interface BackendHealthStatus {
  backend: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  error?: string;
}

interface HealthData {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  backends: {
    python: BackendHealthStatus;
    nodejs: BackendHealthStatus;
  };
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
  recommendations: string[];
}

export const useBackendHealth = (autoRefresh = true, intervalMs = 30000) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await cloudflare.functions.invoke('backend-health-monitor');
      
      if (invokeError) {
        throw new Error(invokeError.message);
      }
      
      setHealthData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check backend health';
      setError(errorMessage);
      console.error('Health check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    if (autoRefresh) {
      const interval = setInterval(checkHealth, intervalMs);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, intervalMs]);

  return {
    healthData,
    isLoading,
    error,
    refetch: checkHealth
  };
};
