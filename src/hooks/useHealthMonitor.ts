
import { useState, useEffect } from 'react';
import { HealthMonitorService, HealthStatus } from '@/services/healthMonitorService';

export const useHealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'unknown',
    responseTime: 0,
    uptime: 'Not checked',
    lastChecked: new Date(),
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const healthMonitor = HealthMonitorService.getInstance();
    
    const unsubscribe = healthMonitor.subscribe((status) => {
      setHealthStatus(status);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const performManualCheck = async () => {
    setIsLoading(true);
    try {
      const healthMonitor = HealthMonitorService.getInstance();
      await healthMonitor.manualCheck();
    } catch (error) {
      console.log('Manual check completed with error:', error);
    }
    // Note: setIsLoading(false) will be called by the subscriber
  };

  const resetCircuitBreaker = () => {
    const healthMonitor = HealthMonitorService.getInstance();
    healthMonitor.resetCircuitBreaker();
  };

  return {
    healthStatus,
    isLoading,
    performManualCheck,
    resetCircuitBreaker
  };
};
