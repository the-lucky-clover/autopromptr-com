
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';
import { useConsoleOutput } from '@/hooks/useConsoleOutput';
import { StatusLight, StatusBadge } from './StatusIndicators';
import ConsoleOutputDisplay from './ConsoleOutputDisplay';

const ServerStatusConsole = ({ isCompact = false }: { isCompact?: boolean }) => {
  const { healthStatus, isLoading, performManualCheck, resetCircuitBreaker } = useHealthMonitor();
  const { consoleOutput, addConsoleLog } = useConsoleOutput([
    '[System] Health monitor initialized',
    '[System] Using global circuit breaker protection',
    '[System] Backend hammering prevention active'
  ]);

  const handleManualRefresh = async () => {
    addConsoleLog('Manual health check requested...', 'info');
    try {
      await performManualCheck();
      addConsoleLog('Manual health check completed', 'info');
    } catch (error) {
      addConsoleLog('Manual health check failed - backend may be unreachable', 'error');
    }
  };

  const handleResetCircuitBreaker = () => {
    addConsoleLog('Circuit breaker reset requested...', 'warning');
    resetCircuitBreaker();
    addConsoleLog('Circuit breaker reset completed', 'info');
  };

  const circuitBreakerState = healthStatus.circuitBreakerState;

  // Determine the appropriate status message
  const getStatusMessage = () => {
    if (circuitBreakerState?.status === 'circuit_open') {
      return 'Backend Protected (Circuit Breaker)';
    }
    if (circuitBreakerState?.status === 'grace_period') {
      return 'Recovery Mode';
    }
    switch (healthStatus.status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'degraded':
        return 'System Performance Degraded';
      case 'unhealthy':
        return healthStatus.error?.includes('CORS') || healthStatus.error?.includes('500') 
          ? 'Backend Unreachable (Connection Error)' 
          : 'System Unavailable';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Status
          </CardTitle>
          <div className="flex items-center space-x-3">
            <StatusBadge status={healthStatus.status} circuitBreakerState={circuitBreakerState} />
            <Button
              onClick={handleManualRefresh}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="bg-gray-800/50 border-white/20 text-white hover:bg-gray-700/50 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus.status === 'healthy' 
                ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
                : healthStatus.status === 'degraded'
                ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50'
                : 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
            }`}></div>
            <span className={`font-medium ${
              healthStatus.status === 'healthy' 
                ? 'text-green-400' 
                : healthStatus.status === 'degraded'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {getStatusMessage()}
            </span>
          </div>
        </div>

        {circuitBreakerState && (circuitBreakerState.status !== 'healthy') && (
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-medium text-sm">Circuit Breaker Protection Active</span>
            </div>
            <p className="text-purple-200 text-xs mb-2">
              Backend hammering prevention is protecting the server from excessive requests.
            </p>
            {circuitBreakerState.nextRetryIn > 0 && (
              <p className="text-purple-200 text-xs">
                Next retry in: {Math.ceil(circuitBreakerState.nextRetryIn / 1000)}s
              </p>
            )}
            <Button
              onClick={handleResetCircuitBreaker}
              size="sm"
              variant="outline"
              className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 rounded-lg mt-2"
            >
              Reset Circuit Breaker
            </Button>
          </div>
        )}

        <ConsoleOutputDisplay consoleOutput={consoleOutput} />

        {healthStatus.error && (
          <div className="text-xs text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg p-2">
            <strong>Connection Details:</strong> {
              healthStatus.error.includes('CORS') 
                ? 'Backend CORS configuration issue - this is expected in development'
                : healthStatus.error.includes('500')
                ? 'Backend server error - the service may be starting up'
                : healthStatus.error
            }
          </div>
        )}

        <div className="text-xs text-white/50 border-t border-white/10 pt-3">
          Last updated: {healthStatus.lastChecked.toLocaleTimeString()}
          <div className="mt-1">
            Response time: {healthStatus.responseTime}ms • Status: {healthStatus.uptime}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerStatusConsole;
