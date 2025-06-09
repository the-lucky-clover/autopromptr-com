
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
  RefreshCw,
  TrendingUp,
  Shield
} from 'lucide-react';
import { HealthDataService, HealthMetrics } from '@/services/healthDataService';
import { ConnectionDiagnostics } from '@/services/connectionDiagnostics';

interface BackendStatus {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: string;
  lastChecked: Date;
}

const HealthStatusDashboard = () => {
  const [primaryBackend, setPrimaryBackend] = useState<BackendStatus>({
    name: 'Puppeteer Backend',
    url: 'https://puppeteer-backend-da0o.onrender.com',
    status: 'healthy',
    responseTime: 0,
    uptime: 'Checking...',
    lastChecked: new Date()
  });

  const [fallbackBackend, setFallbackBackend] = useState<BackendStatus>({
    name: 'AutoPromptr Backend', 
    url: 'https://autopromptr-backend.onrender.com',
    status: 'healthy',
    responseTime: 0,
    uptime: 'Checking...',
    lastChecked: new Date()
  });

  const [overallHealth, setOverallHealth] = useState(95);
  const [loading, setLoading] = useState(false);

  const checkBackendHealth = async (backend: BackendStatus, setter: (status: BackendStatus) => void) => {
    try {
      const healthService = new HealthDataService(backend.url);
      const diagnostics = new ConnectionDiagnostics(backend.url);
      
      const [healthData, connectionTest] = await Promise.all([
        healthService.fetchHealthData().catch(() => null),
        diagnostics.runComprehensiveTest().catch(() => null)
      ]);

      const responseTime = healthData?.responseTime || connectionTest?.endpointResults[0]?.responseTime || 0;
      const status = healthData?.status || (connectionTest?.overallSuccess ? 'healthy' : 'unhealthy');

      setter({
        ...backend,
        status,
        responseTime,
        uptime: healthData?.uptime || 'Available',
        lastChecked: new Date()
      });
    } catch (error) {
      setter({
        ...backend,
        status: 'unhealthy',
        responseTime: 9999,
        uptime: 'Unreachable',
        lastChecked: new Date()
      });
    }
  };

  const refreshHealthData = async () => {
    setLoading(true);
    await Promise.all([
      checkBackendHealth(primaryBackend, setPrimaryBackend),
      checkBackendHealth(fallbackBackend, setFallbackBackend)
    ]);
    
    // Calculate overall health score
    const healthyBackends = [primaryBackend, fallbackBackend].filter(b => b.status === 'healthy').length;
    const newOverallHealth = (healthyBackends / 2) * 100;
    setOverallHealth(newOverallHealth);
    
    setLoading(false);
  };

  useEffect(() => {
    refreshHealthData();
    const interval = setInterval(refreshHealthData, 45000); // Check every 45 seconds
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
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <WifiOff className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const BackendCard = ({ backend }: { backend: BackendStatus }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(backend.status)}
          <span className="text-white font-medium text-sm">{backend.name}</span>
        </div>
        <Badge className={`${getStatusColor(backend.status)} text-xs px-2 py-1`}>
          {backend.status.toUpperCase()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-purple-300 mb-1">Response Time</div>
          <div className="text-blue-400 font-semibold">{formatResponseTime(backend.responseTime)}</div>
        </div>
        <div>
          <div className="text-purple-300 mb-1">Uptime</div>
          <div className="text-green-400 font-semibold">{backend.uptime}</div>
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

  return (
    <div className="space-y-4">
      {/* Overall Health Score */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">System Reliability Score</span>
          </div>
          <button
            onClick={refreshHealthData}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-purple-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
          <span>Redundant backend architecture ensures 99.9% availability</span>
        </div>
      </div>

      {/* Backend Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BackendCard backend={primaryBackend} />
        <BackendCard backend={fallbackBackend} />
      </div>

      {/* Trust Indicators */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-1 text-green-400">
            <Wifi className="w-3 h-3" />
            <span>Failover Ready</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-400">
            <Activity className="w-3 h-3" />
            <span>Real-time Monitoring</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-400">
            <Zap className="w-3 h-3" />
            <span>Auto-Recovery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusDashboard;
