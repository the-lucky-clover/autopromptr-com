
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Server
} from 'lucide-react';
import { HealthMetrics } from '@/services/healthDataService';

interface HealthMetricsStatusProps {
  healthData: HealthMetrics | null;
  loading: boolean;
}

const HealthMetricsStatus = ({ healthData, loading }: HealthMetricsStatusProps) => {
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

  return (
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
  );
};

export default HealthMetricsStatus;
