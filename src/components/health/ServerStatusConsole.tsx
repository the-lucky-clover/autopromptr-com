
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, RefreshCw, Server, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';

const ServerStatusConsole = ({ isCompact = false }: { isCompact?: boolean }) => {
  const { healthStatus, isLoading, performManualCheck, resetCircuitBreaker } = useHealthMonitor();
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[System] Health monitor initialized',
    '[System] Using global circuit breaker protection',
    '[System] Backend hammering prevention active'
  ]);

  const addConsoleLog = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    setConsoleOutput(prev => [...prev.slice(-8), `[${timestamp}] ${prefix} ${message}`]);
  };

  const handleManualRefresh = async () => {
    addConsoleLog('Manual health check requested...', 'info');
    try {
      await performManualCheck();
      addConsoleLog('Manual health check completed', 'info');
    } catch (error) {
      addConsoleLog('Manual health check failed', 'error');
    }
  };

  const handleResetCircuitBreaker = () => {
    addConsoleLog('Circuit breaker reset requested...', 'warning');
    resetCircuitBreaker();
    addConsoleLog('Circuit breaker reset completed', 'info');
  };

  const getStatusLight = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-green-400 font-medium">All Systems Operational</span>
          </div>
        );
      case 'degraded':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
            <span className="text-yellow-400 font-medium">System Warning</span>
          </div>
        );
      case 'unhealthy':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
            <span className="text-red-400 font-medium">System Failure</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 font-medium">Status Unknown</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string, circuitBreakerState?: any) => {
    if (circuitBreakerState?.status === 'grace_period') {
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
          GRACE PERIOD
        </Badge>
      );
    }
    
    if (circuitBreakerState?.status === 'circuit_open') {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
          CIRCUIT OPEN
        </Badge>
      );
    }

    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
            OPERATIONAL
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
            DEGRADED
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1">
            UNAVAILABLE
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1">
            UNKNOWN
          </Badge>
        );
    }
  };

  const circuitBreakerState = healthStatus.circuitBreakerState;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-400" />
            Server Status
          </CardTitle>
          <div className="flex items-center space-x-3">
            {getStatusBadge(healthStatus.status, circuitBreakerState)}
            <Button
              onClick={handleManualRefresh}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Light Indicator */}
        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          {getStatusLight(healthStatus.status)}
        </div>

        {/* Circuit Breaker Information */}
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

        {/* Console Output */}
        <div className="bg-black/50 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">Protected Health Monitor</span>
          </div>
          
          <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
            {consoleOutput.map((log, index) => (
              <div 
                key={index} 
                className={`${
                  log.includes('❌') ? 'text-red-300' : 
                  log.includes('⚠️') ? 'text-yellow-300' : 
                  'text-green-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {healthStatus.error && (
          <div className="text-xs text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg p-2">
            Error: {healthStatus.error}
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
