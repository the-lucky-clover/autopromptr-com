
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBackendTesting } from '@/hooks/useBackendTesting';
import { BackendStatus, HealthStatusDashboardProps, HEALTH_CHECK_INTERVAL } from './health/HealthStatusTypes';
import { checkBackendHealth } from './health/HealthCheckService';
import { CompactBackendCard, BackendCard } from './health/BackendStatusCard';
import TestResultsDisplay from './health/TestResultsDisplay';
import TrustIndicators from './health/TrustIndicators';
import SystemHealthHeader from './health/SystemHealthHeader';

const HealthStatusDashboard = ({ isCompact = false }: HealthStatusDashboardProps) => {
  const location = useLocation();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Route guard - ensure we're on a dashboard route
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  
  if (!isDashboardRoute) {
    if (isDevelopment) {
      console.log('HealthStatusDashboard: Component mounted on non-dashboard route, returning null');
    }
    return null;
  }

  if (isDevelopment) {
    console.log('HealthStatusDashboard: Component instantiated - health checks will run');
  }

  const { 
    isRunning, 
    lastTestResults, 
    runFullTestSuite, 
    runQuickHealthCheck, 
    getTestSummary 
  } = useBackendTesting();

  const [primaryBackend, setPrimaryBackend] = useState<BackendStatus>({
    name: 'Backend Server Echo',
    shortName: 'Echo [∃]',
    url: 'https://autopromptr-backend.onrender.com',
    status: 'healthy',
    responseTime: 0,
    uptime: 'Connected',
    lastChecked: new Date(),
    icon: '∃',
    isConnected: true
  });

  const [fallbackBackend, setFallbackBackend] = useState<BackendStatus>({
    name: 'Backup Server',
    shortName: 'Backup [B]',
    url: 'https://autopromptr-fallback.onrender.com',
    status: 'healthy',
    responseTime: 0,
    uptime: 'Standby',
    lastChecked: new Date(),
    icon: 'B',
    isConnected: false
  });

  const [overallHealth, setOverallHealth] = useState(75);

  const refreshHealthData = async () => {
    console.log('HealthStatusDashboard: Running health check');
    
    // Run health checks for backends
    await Promise.all([
      checkBackendHealth(primaryBackend, setPrimaryBackend, 'primaryBackend'),
      checkBackendHealth(fallbackBackend, setFallbackBackend, 'fallbackBackend')
    ]);
    
    // Run comprehensive test on the active backend (but don't wait for it)
    runQuickHealthCheck().catch(error => {
      console.log('Quick health check failed (silenced):', error.message);
    });
  };

  const runComprehensiveTests = async () => {
    try {
      await runFullTestSuite();
    } catch (error) {
      console.log('Comprehensive tests failed (silenced):', error);
    }
  };

  useEffect(() => {
    console.log('HealthStatusDashboard: Starting health monitoring');
    refreshHealthData();
    
    // Start health check interval
    const interval = setInterval(refreshHealthData, HEALTH_CHECK_INTERVAL);
    
    return () => {
      console.log('HealthStatusDashboard: Cleaning up health monitoring');
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Calculate overall health based on actual backend status
    const testSummary = getTestSummary();
    
    if (testSummary) {
      setOverallHealth(testSummary.passRate);
    } else {
      // Base calculation on backend connectivity
      const primaryWeight = 70;
      const fallbackWeight = 30;
      
      const primaryScore = primaryBackend.isConnected ? 100 : 0;
      const fallbackScore = fallbackBackend.isConnected ? 100 : 0;
      
      const weightedScore = (
        (primaryScore * primaryWeight + fallbackScore * fallbackWeight) / 100
      );
      
      setOverallHealth(weightedScore);
    }
  }, [primaryBackend, fallbackBackend, lastTestResults, getTestSummary]);

  if (isCompact) {
    return (
      <div className="space-y-3">
        <SystemHealthHeader
          overallHealth={overallHealth}
          isRunning={isRunning}
          isCompact={true}
          onRefresh={refreshHealthData}
          onRunTests={runComprehensiveTests}
        />

        {/* Compact Backend Cards */}
        <div className="grid grid-cols-1 gap-2">
          <CompactBackendCard backend={primaryBackend} />
          <CompactBackendCard backend={fallbackBackend} />
        </div>

        <TestResultsDisplay lastTestResults={lastTestResults} isCompact={true} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SystemHealthHeader
        overallHealth={overallHealth}
        isRunning={isRunning}
        isCompact={false}
        onRefresh={refreshHealthData}
        onRunTests={runComprehensiveTests}
      />

      {/* Backend Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BackendCard backend={primaryBackend} />
        <BackendCard backend={fallbackBackend} />
      </div>

      <TestResultsDisplay lastTestResults={lastTestResults} isCompact={false} />
      <TrustIndicators />
    </div>
  );
};

export default HealthStatusDashboard;
