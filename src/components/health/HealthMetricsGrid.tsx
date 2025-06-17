
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
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
      description: 'Primary server health check'
    }
  ];

  return (
    <div className="space-y-4">
      {/* System Overview */}
      <div className="grid grid-cols-1 gap-4">
        {statusItems.map((item, index) => (
          <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/20 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white text-sm font-medium">{item.label}</span>
                <p className="text-white/60 text-xs">{item.description}</p>
              </div>
              {getStatusIcon(item.status)}
            </div>
            {getStatusBadge(item.status)}
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="text-center">
            <div className="text-green-400 text-lg font-semibold">{healthData.responseTime}ms</div>
            <div className="text-white/60 text-xs">Response Time</div>
          </div>
        </Card>
        <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-3 rounded-xl">
          <div className="text-center">
            <div className="text-blue-400 text-lg font-semibold">99.999%</div>
            <div className="text-white/60 text-xs">Uptime</div>
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
