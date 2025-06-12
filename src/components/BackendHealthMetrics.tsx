
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Server, 
  Zap, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Database,
  Cpu
} from 'lucide-react';
import { HealthDataService, HealthMetrics } from '@/services/healthDataService';

const BackendHealthMetrics = () => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const healthService = new HealthDataService();

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await healthService.fetchHealthData();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health data';
      setError(errorMessage);
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 border-green-400 bg-green-400/20';
      case 'degraded': return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
      case 'unhealthy': return 'text-red-400 border-red-400 bg-red-400/20';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Wifi className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <WifiOff className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <CardTitle className="text-white text-base mb-1">Backend Health</CardTitle>
              <CardDescription className="text-purple-200 text-sm">
                Live backend monitoring
              </CardDescription>
            </div>
            <Button
              onClick={fetchHealthData}
              disabled={loading}
              size="sm"
              variant="ghost"
              className="text-white hover:text-purple-200 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3 text-red-300 mb-2">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">Connection Failed</span>
            </div>
            <p className="text-red-200 text-xs break-words">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-white text-base mb-1">Backend Health</CardTitle>
            <CardDescription className="text-purple-200 text-sm">
              Live backend monitoring
            </CardDescription>
          </div>
          <Button
            onClick={fetchHealthData}
            disabled={loading}
            size="sm"
            variant="ghost"
            className="text-white hover:text-purple-200 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Main Status with improved spacing */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {healthData && getStatusIcon(healthData.status)}
              <span className="text-white font-medium text-sm">System Status</span>
            </div>
            {healthData && (
              <Badge className={`${getStatusColor(healthData.status)} text-xs px-3 py-1`}>
                {healthData.status.toUpperCase()}
              </Badge>
            )}
          </div>
          
          {loading && (
            <div className="flex items-center space-x-3 text-purple-200">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Checking status...</span>
            </div>
          )}
        </div>

        {healthData && (
          <>
            {/* Metrics Grid with consistent spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Response Time */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-white text-xs font-medium">Response</span>
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {formatResponseTime(healthData.responseTime)}
                </div>
              </div>

              {/* Uptime */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-white text-xs font-medium">Uptime</span>
                </div>
                <div className="text-sm font-medium text-green-400 truncate">
                  {healthData.uptime}
                </div>
              </div>
            </div>

            {/* Additional Metrics with improved spacing */}
            {healthData.database && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-white text-xs font-medium">Database</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-xs">{healthData.database.status}</span>
                  {healthData.database.responseTime && (
                    <span className="text-purple-400 text-xs">
                      {formatResponseTime(healthData.database.responseTime)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {healthData.memory && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Cpu className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="text-white text-xs font-medium">Memory Usage</span>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={healthData.memory.percentage} 
                    className="h-2 bg-white/10"
                  />
                  <div className="flex justify-between text-xs text-orange-200">
                    <span>{healthData.memory.used}MB used</span>
                    <span>{healthData.memory.percentage}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated with better spacing */}
            {lastUpdated && (
              <div className="text-xs text-purple-300 text-center pt-2 border-t border-white/10">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendHealthMetrics;
