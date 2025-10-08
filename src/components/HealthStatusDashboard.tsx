
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { HealthStatusDashboardProps } from './health/HealthStatusTypes';
import { CompactBackendCard, BackendCard } from './health/BackendStatusCard';
import TestResultsDisplay from './health/TestResultsDisplay';
import TrustIndicators from './health/TrustIndicators';
import SystemHealthHeader from './health/SystemHealthHeader';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';
import { useBackendTesting } from '@/hooks/useBackendTesting';

const HealthStatusDashboard = React.memo(({ isCompact = false }: HealthStatusDashboardProps) => {
  const location = useLocation();
  const { healthStatus, isLoading, performManualCheck } = useHealthMonitor();
  const { lastTestResults, runFullTestSuite, getTestSummary } = useBackendTesting();
  
  // Route guard - ensure we're on a dashboard route
  const isDashboardRoute = useMemo(() => 
    location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/'),
    [location.pathname]
  );
  
  if (!isDashboardRoute) {
    return null;
  }

  // Convert health status to backend status format
  const primaryBackend = {
    name: 'AutoPromptr Backend Server',
    shortName: 'Server [AP]',
    url: 'https://autopromptr-backend.onrender.com',
    status: healthStatus.status,
    responseTime: healthStatus.responseTime,
    uptime: healthStatus.uptime,
    lastChecked: healthStatus.lastChecked,
    icon: 'AP',
    isConnected: healthStatus.isConnected
  };

  // Calculate overall health
  const testSummary = useMemo(() => getTestSummary(), [lastTestResults, getTestSummary]);
  const overallHealth = useMemo(() => {
    if (testSummary) {
      return testSummary.passRate;
    }
    return healthStatus.isConnected ? 100 : 0;
  }, [testSummary, healthStatus.isConnected]);

  const runComprehensiveTests = async () => {
    try {
      await runFullTestSuite();
    } catch (error) {
      console.log('Comprehensive tests completed with errors:', error);
    }
  };

  if (isCompact) {
    return (
      <div className="h-[650px] flex flex-col space-y-3 overflow-hidden">
        <SystemHealthHeader
          overallHealth={overallHealth}
          isRunning={isLoading}
          isCompact={true}
          onRefresh={performManualCheck}
          onRunTests={runComprehensiveTests}
        />

        <div className="grid grid-cols-1 gap-2">
          <CompactBackendCard backend={primaryBackend} />
        </div>

        <TestResultsDisplay lastTestResults={lastTestResults} isCompact={true} />
      </div>
    );
  }

  return (
    <div className="h-[650px] flex flex-col space-y-4 overflow-hidden">
      <SystemHealthHeader
        overallHealth={overallHealth}
        isRunning={isLoading}
        isCompact={false}
        onRefresh={performManualCheck}
        onRunTests={runComprehensiveTests}
      />

      <div className="grid grid-cols-1 gap-4">
        <BackendCard backend={primaryBackend} />
      </div>

      <TestResultsDisplay lastTestResults={lastTestResults} isCompact={false} />
      <TrustIndicators />
    </div>
  );
});

HealthStatusDashboard.displayName = 'HealthStatusDashboard';

export default HealthStatusDashboard;
