import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Zap, 
  Wifi, 
  WifiOff, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Shield,
  TestTube
} from 'lucide-react';
import { useBackendTesting } from '@/hooks/useBackendTesting';
import { useAuth } from '@/hooks/useAuth';

interface BackendStatus {
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

interface HealthStatusDashboardProps {
  isCompact?: boolean;
}

// Circuit breaker state management
const circuitBreakerState = {
  primaryBackend: { failures: 0, isOpen: false, lastFailure: 0 },
  fallbackBackend: { failures: 0, isOpen: false, lastFailure: 0 }
};

const MAX_FAILURES = 3;
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes (reduced from 30 seconds)

const HealthStatusDashboard = ({ isCompact = false }: HealthStatusDashboardProps) => {
  const { user, isEmailVerified } = useAuth();
  
  // Early return - don't render anything if not authenticated or not on dashboard
  if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
    console.log('HealthStatusDashboard: Skipping render - not authenticated or not on dashboard');
    return null;
  }

  const { 
    isRunning, 
    lastTestResults, 
    lastQuickCheck, 
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

  const checkCircuitBreaker = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
    const state = circuitBreakerState[backendKey];
    const now = Date.now();
    
    if (state.isOpen) {
      if (now - state.lastFailure > CIRCUIT_BREAKER_TIMEOUT) {
        console.log(`Circuit breaker reset for ${backendKey}`);
        state.isOpen = false;
        state.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  };

  const recordFailure = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
    const state = circuitBreakerState[backendKey];
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= MAX_FAILURES) {
      state.isOpen = true;
      console.log(`Circuit breaker opened for ${backendKey} after ${state.failures} failures`);
    }
  };

  const recordSuccess = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
    const state = circuitBreakerState[backendKey];
    state.failures = 0;
    state.isOpen = false;
  };

  const checkBackendHealth = async (backend: BackendStatus, setter: (status: BackendStatus) => void, backendKey: 'primaryBackend' | 'fallbackBackend') => {
    // Skip if circuit breaker is open
    if (checkCircuitBreaker(backendKey)) {
      console.log(`Skipping health check for ${backend.name} - circuit breaker open`);
      setter({
        ...backend,
        status: 'unhealthy',
        uptime: 'Circuit Breaker Open',
        isConnected: false,
        lastChecked: new Date()
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout
      
      const startTime = Date.now();
      
      const response = await fetch(backend.url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const isConnected = response.ok || response.status < 500;
      const status = isConnected 
        ? (responseTime > 5000 ? 'degraded' : 'healthy')
        : 'unhealthy';
      
      if (isConnected) {
        recordSuccess(backendKey);
      } else {
        recordFailure(backendKey);
      }
      
      setter({
        ...backend,
        status,
        responseTime,
        uptime: isConnected ? 'Connected' : 'Disconnected',
        lastChecked: new Date(),
        isConnected
      });
    } catch (error) {
      recordFailure(backendKey);
      setter({
        ...backend,
        status: 'unhealthy',
        responseTime: 0,
        uptime: 'Connection Failed',
        lastChecked: new Date(),
        isConnected: false
      });
    }
  };

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
    // Double-check we should run health checks
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      return;
    }

    console.log('HealthStatusDashboard: Starting health monitoring');
    refreshHealthData();
    
    // Reduced frequency health checks
    const interval = setInterval(refreshHealthData, HEALTH_CHECK_INTERVAL);
    
    return () => {
      console.log('HealthStatusDashboard: Cleaning up health monitoring');
      clearInterval(interval);
    };
  }, [user, isEmailVerified]);

  useEffect(() => {
    // Calculate overall health based on actual backend status
    const testSummary = getTestSummary();
    
    if (testSummary) {
      setOverallHealth(testSummary.passRate);
    } else {
      // Base calculation on backend connectivity
      const primaryWeight = 70; // Primary backend weight
      const fallbackWeight = 30; // Fallback backend weight
      
      const primaryScore = primaryBackend.isConnected ? 100 : 0;
      const fallbackScore = fallbackBackend.isConnected ? 100 : 0;
      
      const weightedScore = (
        (primaryScore * primaryWeight + fallbackScore * fallbackWeight) / 100
      );
      
      setOverallHealth(weightedScore);
    }
  }, [primaryBackend, fallbackBackend, lastTestResults, getTestSummary]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 border-green-400 bg-green-400/20';
      case 'degraded': return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
      case 'unhealthy': return 'text-red-400 border-red-400 bg-red-400/20';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (backend: BackendStatus) => {
    if (!backend.isConnected) return <XCircle className="w-4 h-4" />;
    
    switch (backend.status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <WifiOff className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const CompactBackendCard = ({ backend }: { backend: BackendStatus }) => (
    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <span className="text-purple-300 text-xs font-mono">{backend.icon}</span>
          <span className="text-white font-medium text-xs">{backend.shortName}</span>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(backend)}
          <Badge className={`${getStatusColor(backend.status)} text-[10px] px-1 py-0`}>
            {backend.isConnected ? backend.status.charAt(0).toUpperCase() : 'OFF'}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div>
          <div className="text-purple-300">Response</div>
          <div className={`font-semibold ${backend.isConnected ? 'text-blue-400' : 'text-red-400'}`}>
            {formatResponseTime(backend.responseTime)}
          </div>
        </div>
        <div>
          <div className="text-purple-300">Status</div>
          <div className={`font-semibold ${backend.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {backend.uptime}
          </div>
        </div>
      </div>
    </div>
  );

  const BackendCard = ({ backend }: { backend: BackendStatus }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(backend)}
          <span className="text-white font-medium text-sm">{backend.name}</span>
        </div>
        <Badge className={`${getStatusColor(backend.status)} text-xs px-2 py-1`}>
          {backend.isConnected ? backend.status.toUpperCase() : 'OFFLINE'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-purple-300 mb-1">Response Time</div>
          <div className={`font-semibold ${backend.isConnected ? 'text-blue-400' : 'text-red-400'}`}>
            {formatResponseTime(backend.responseTime)}
          </div>
        </div>
        <div>
          <div className="text-purple-300 mb-1">Connection</div>
          <div className={`font-semibold ${backend.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {backend.uptime}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-purple-300 break-all">
        {backend.url}
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Last checked: {backend.lastChecked.toLocaleTimeString()}
      </div>
    </div>
  );

  if (isCompact) {
    return (
      <div className="space-y-3">
        {/* Compact Overall Health */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-white font-semibold text-xs">System Health</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={runComprehensiveTests}
                disabled={isRunning}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Run comprehensive tests"
              >
                <TestTube className={`w-3 h-3 text-blue-300 ${isRunning ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={refreshHealthData}
                disabled={isRunning}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 text-purple-300 ${isRunning ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Progress value={overallHealth} className="h-2 bg-white/10" />
            </div>
            <div className="text-lg font-bold text-white">
              {overallHealth.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Compact Backend Cards */}
        <div className="grid grid-cols-1 gap-2">
          <CompactBackendCard backend={primaryBackend} />
          <CompactBackendCard backend={fallbackBackend} />
        </div>

        {/* Test Results Summary */}
        {lastTestResults && (
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-purple-300">Tests: {lastTestResults.tests.length}</span>
              <span className="text-green-400">Pass: {lastTestResults.tests.filter(t => t.status === 'passed').length}</span>
              <span className="text-red-400">Fail: {lastTestResults.tests.filter(t => t.status === 'failed').length}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Health Score */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">System Reliability Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runComprehensiveTests}
              disabled={isRunning}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Run comprehensive tests"
            >
              <TestTube className={`w-4 h-4 text-blue-300 ${isRunning ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={refreshHealthData}
              disabled={isRunning}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-purple-300 ${isRunning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Progress value={overallHealth} className="h-3 bg-white/10" />
          </div>
          <div className="text-2xl font-bold text-white">
            {overallHealth.toFixed(0)}%
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 text-sm text-purple-200">
          <TrendingUp className="w-4 h-4" />
          <span>Optimized monitoring with circuit breaker protection</span>
        </div>
      </div>

      {/* Backend Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BackendCard backend={primaryBackend} />
        <BackendCard backend={fallbackBackend} />
      </div>

      {/* Test Results */}
      {lastTestResults && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Latest Test Results</span>
            <Badge className={`${getStatusColor(lastTestResults.overallStatus)} text-xs px-2 py-1`}>
              {lastTestResults.overallStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-purple-300 mb-1">Total Tests</div>
              <div className="text-white font-semibold">{lastTestResults.tests.length}</div>
            </div>
            <div>
              <div className="text-purple-300 mb-1">Passed</div>
              <div className="text-green-400 font-semibold">
                {lastTestResults.tests.filter(t => t.status === 'passed').length}
              </div>
            </div>
            <div>
              <div className="text-purple-300 mb-1">Failed</div>
              <div className="text-red-400 font-semibold">
                {lastTestResults.tests.filter(t => t.status === 'failed').length}
              </div>
            </div>
            <div>
              <div className="text-purple-300 mb-1">Pass Rate</div>
              <div className="text-blue-400 font-semibold">{lastTestResults.passRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-1 text-green-400">
            <Wifi className="w-3 h-3" />
            <span>Smart Monitoring</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-400">
            <Activity className="w-3 h-3" />
            <span>Circuit Breaker Protection</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-400">
            <Zap className="w-3 h-3" />
            <span>Optimized Performance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusDashboard;
