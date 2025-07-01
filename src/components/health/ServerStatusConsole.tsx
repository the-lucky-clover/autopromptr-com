
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, RefreshCw, Server, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  database?: {
    status: string;
    responseTime?: number;
  };
}

const ServerStatusConsole = ({ isCompact = false }: { isCompact?: boolean }) => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [errorType, setErrorType] = useState<'cors' | 'network' | 'timeout' | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const addConsoleLog = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    setConsoleOutput(prev => [...prev.slice(-10), `[${timestamp}] ${prefix} ${message}`]);
  };

  const categorizeError = (error: any): 'cors' | 'network' | 'timeout' => {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
      return 'cors';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return 'timeout';
    }
    return 'network';
  };

  const fetchHealthData = async (isRetry = false) => {
    if (loading) return;
    
    setLoading(true);
    setErrorType(null);
    
    if (!isRetry) {
      addConsoleLog('Initiating health check...');
    } else {
      addConsoleLog(`Retry attempt ${retryCount + 1}...`, 'warning');
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('https://autopromptr-backend.onrender.com/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastUpdated(new Date());
        setRetryCount(0);
        addConsoleLog(`Health check successful - Status: ${data.status}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorCategory = categorizeError(error);
      setErrorType(errorCategory);
      
      let errorMessage = '';
      switch (errorCategory) {
        case 'cors':
          errorMessage = 'CORS policy blocking request - Backend configuration needed';
          break;
        case 'timeout':
          errorMessage = 'Request timeout - Backend may be starting up (cold start)';
          break;
        case 'network':
          errorMessage = 'Network error - Backend may be unavailable';
          break;
      }
      
      addConsoleLog(errorMessage, 'error');
      
      setHealthData({
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      });
      
      // Exponential backoff for retries
      if (retryCount < 3 && errorCategory !== 'cors') {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchHealthData(true);
        }, backoffDelay);
      }
    } finally {
      setLoading(false);
    }
  };

  const manualRefresh = () => {
    setRetryCount(0);
    fetchHealthData(false);
  };

  useEffect(() => {
    // Initial check with 3 second delay
    const initialTimeout = setTimeout(() => {
      fetchHealthData(false);
    }, 3000);

    // Set up interval for periodic checks (every 2 minutes)
    const interval = setInterval(() => {
      if (errorType !== 'cors') { // Don't spam CORS errors
        fetchHealthData(false);
      }
    }, 120000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [errorType]);

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

  const getStatusBadge = (status: string) => {
    if (errorType === 'cors') {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
          CORS BLOCKED
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
            WARNING
          </Badge>
        );
      case 'unhealthy':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1">
            FAILURE
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

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-400" />
            Server Status
          </CardTitle>
          <div className="flex items-center space-x-3">
            {healthData && getStatusBadge(healthData.status)}
            <Button
              onClick={manualRefresh}
              disabled={loading}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Light Indicator */}
        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          {healthData ? getStatusLight(healthData.status) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 font-medium">Checking status...</span>
            </div>
          )}
        </div>

        {/* CORS Information Banner */}
        {errorType === 'cors' && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-medium text-sm">CORS Configuration Required</span>
            </div>
            <p className="text-orange-200 text-xs">
              The backend server needs to be configured to allow requests from this domain. 
              This is normal for development environments.
            </p>
          </div>
        )}

        {/* Console Output */}
        <div className="bg-black/50 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-mono text-sm">autopromptr-backend.onrender.com/health</span>
          </div>
          
          <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
            {consoleOutput.length === 0 ? (
              <div className="text-gray-500">Initializing health monitor...</div>
            ) : (
              consoleOutput.map((log, index) => (
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
              ))
            )}
          </div>
        </div>

        {/* System Metrics */}
        {healthData && !isCompact && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthData.memory && (
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white text-sm font-medium mb-2">Memory Usage</div>
                <div className="text-xs text-white/70">
                  {((healthData.memory.used / 1024 / 1024)).toFixed(1)}MB / {((healthData.memory.total / 1024 / 1024)).toFixed(1)}MB
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${healthData.memory.percentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {healthData.database && (
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white text-sm font-medium mb-2">Database</div>
                <div className="text-xs text-white/70">
                  Status: {healthData.database.status}
                  {healthData.database.responseTime && (
                    <div>Response: {healthData.database.responseTime}ms</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {lastUpdated && (
          <div className="text-xs text-white/50 border-t border-white/10 pt-3">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {retryCount > 0 && (
              <span className="ml-2 text-yellow-400">
                (Retry {retryCount}/3)
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerStatusConsole;
