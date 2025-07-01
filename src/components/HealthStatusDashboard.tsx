
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useBackendTesting } from '@/hooks/useBackendTesting';
import { BackendStatus, HealthStatusDashboardProps, HEALTH_CHECK_INTERVAL } from './health/HealthStatusTypes';
import { checkBackendHealth } from './health/HealthCheckService';
import { CompactBackendCard, BackendCard } from './health/BackendStatusCard';
import TestResultsDisplay from './health/TestResultsDisplay';
import TrustIndicators from './health/TrustIndicators';
import SystemHealthHeader from './health/SystemHealthHeader';

const HealthStatusDashboard = React.memo(({ isCompact = false }: HealthStatusDashboardProps) => {
  const location = useLocation();
  const isDevelopment = useMemo(() => process.env.NODE_ENV === 'development', []);
  const mounted = useRef(true);
  const lastHealthCheck = useRef(0);
  const healthCheckInProgress = useRef(false);
  
  // Route guard - ensure we're on a dashboard route - memoized to prevent re-calculations
  const isDashboardRoute = useMemo(() => 
    location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/'),
    [location.pathname]
  );
  
  // Move console log to useEffect to prevent render flooding
  useEffect(() => {
    if (!isDashboardRoute && isDevelopment) {
      console.log('HealthStatusDashboard: Component mounted on non-dashboard route, returning null');
    }
  }, [isDashboardRoute, isDevelopment]);
  
  if (!isDashboardRoute) {
    return null;
  }

  const { 
    isRunning, 
    lastTestResults, 
    runFullTestSuite, 
    runQuickHealthCheck, 
    getTestSummary 
  } = useBackendTesting();

  const [primaryBackend, setPrimaryBackend] = useState<BackendStatus>({
    name: 'AutoPromptr Backend Server',
    shortName: 'Server [AP]',
    url: 'https://autopromptr-backend.onrender.com',
    status: 'healthy',
    responseTime: 0,
    uptime: 'Connected',
    lastChecked: new Date(),
    icon: 'AP',
    isConnected: true
  });

  const [overallHealth, setOverallHealth] = useState(75);

  // Memoized and optimized health check function
  const refreshHealthData = useCallback(async () => {
    if (!mounted.current) return;
    
    const now = Date.now();
    // Prevent multiple simultaneous health checks
    if (healthCheckInProgress.current || (now - lastHealthCheck.current) < 30000) {
      return;
    }
    
    healthCheckInProgress.current = true;
    lastHealthCheck.current = now;
    
    try {
      if (isDevelopment) {
        console.log('HealthStatusDashboard: Running debounced health check');
      }
      
      // Run health check for primary backend only
      await checkBackendHealth(primaryBackend, setPrimaryBackend, 'primaryBackend');
      
      // Run quick health check but don't wait for it
      runQuickHealthCheck().catch(error => {
        if (isDevelopment) {
          console.log('Quick health check failed (silenced):', error.message);
        }
      });
      
    } catch (error) {
      if (isDevelopment) {
        console.log('Health check error (silenced):', error);
      }
    } finally {
      healthCheckInProgress.current = false;
    }
  }, [primaryBackend, runQuickHealthCheck, isDevelopment]);

  const runComprehensiveTests = useCallback(async () => {
    if (!mounted.current) return;
    
    try {
      await runFullTestSuite();
    } catch (error) {
      if (isDevelopment) {
        console.log('Comprehensive tests failed (silenced):', error);
      }
    }
  }, [runFullTestSuite, isDevelopment]);

  // Memoized test summary to prevent unnecessary recalculations
  const testSummary = useMemo(() => getTestSummary(), [lastTestResults, getTestSummary]);

  // Effect for initial health check and interval setup
  useEffect(() => {
    if (!mounted.current) return;
    
    if (isDevelopment) {
      console.log('HealthStatusDashboard: Starting health monitoring');
    }
    
    // Initial health check with delay to prevent immediate execution
    const initialTimeout = setTimeout(() => {
      if (mounted.current) {
        refreshHealthData();
      }
    }, 2000);
    
    // Start health check interval
    const interval = setInterval(() => {
      if (mounted.current) {
        refreshHealthData();
      }
    }, HEALTH_CHECK_INTERVAL);
    
    return () => {
      if (isDevelopment) {
        console.log('HealthStatusDashboard: Cleaning up health monitoring');
      }
      clearTimeout(initialTimeout);
      clearInterval(interval);
      mounted.current = false;
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Effect for calculating overall health
  useEffect(() => {
    if (!mounted.current) return;
    
    if (testSummary) {
      setOverallHealth(testSummary.passRate);
    } else {
      // Base calculation on backend connectivity
      const primaryScore = primaryBackend.isConnected ? 100 : 0;
      setOverallHealth(primaryScore);
    }
  }, [primaryBackend.isConnected, testSummary]);

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

        {/* Single Backend Card */}
        <div className="grid grid-cols-1 gap-2">
          <CompactBackendCard backend={primaryBackend} />
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

      {/* Single Backend Status Card */}
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
