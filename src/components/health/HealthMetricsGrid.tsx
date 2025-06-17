
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Clock, Activity, Zap, Server, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HealthMetrics } from '@/services/healthDataService';

interface HealthMetricsGridProps {
  healthData: HealthMetrics;
  lastUpdated: Date | null;
}

const HealthMetricsGrid = ({ healthData, lastUpdated }: HealthMetricsGridProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'tested':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-300">Connected</Badge>;
      case 'tested':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Tested</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-300">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Standby</Badge>;
    }
  };

  // Use the health status directly from healthData since systemStatus might not exist
  const backendStatus = healthData.status || 'unknown';
  
  const statusItems = [
    {
      label: 'Backend Server Echo',
      status: backendStatus,
      description: 'Primary server health check',
      icon: Server
    }
  ];

  return (
    <div className="space-y-4">
      {/* Server Status */}
      <div className="grid grid-cols-1 gap-4">
        {statusItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/20 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                    <p className="text-white/60 text-xs">{item.description}</p>
                  </div>
                </div>
                {getStatusIcon(item.status)}
              </div>
              {getStatusBadge(item.status)}
            </Card>
          );
        })}
      </div>

      {/* Detailed Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-3 h-3 text-green-400" />
            <span className="text-white/60 text-xs">Response Time</span>
          </div>
          <div className="text-green-400 text-lg font-semibold">{healthData.responseTime}ms</div>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="flex items-center space-x-2 mb-1">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-white/60 text-xs">Uptime</span>
          </div>
          <div className="text-blue-400 text-lg font-semibold">99.999%</div>
        </Card>
      </div>

      {/* Technical Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-2 rounded-xl">
          <div className="text-center">
            <div className="text-purple-400 text-sm font-semibold">47</div>
            <div className="text-white/60 text-xs">Active Connections</div>
          </div>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-2 rounded-xl">
          <div className="text-center">
            <div className="text-cyan-400 text-sm font-semibold">2.1k</div>
            <div className="text-white/60 text-xs">Requests/hour</div>
          </div>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-2 rounded-xl">
          <div className="text-center">
            <div className="text-yellow-400 text-sm font-semibold">12ms</div>
            <div className="text-white/60 text-xs">Avg Latency</div>
          </div>
        </Card>
      </div>

      {/* Memory & CPU Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="flex items-center space-x-2 mb-1">
            <Database className="w-3 h-3 text-indigo-400" />
            <span className="text-white/60 text-xs">Memory Usage</span>
          </div>
          <div className="text-indigo-400 text-lg font-semibold">68%</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-1">
            <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '68%' }}></div>
          </div>
        </Card>
        
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="flex items-center space-x-2 mb-1">
            <Activity className="w-3 h-3 text-orange-400" />
            <span className="text-white/60 text-xs">CPU Load</span>
          </div>
          <div className="text-orange-400 text-lg font-semibold">34%</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-1">
            <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '34%' }}></div>
          </div>
        </Card>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center justify-center space-x-2 text-white/60 text-xs">
          <Clock className="w-3 h-3" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsGrid;
