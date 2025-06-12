
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Database,
  Cpu
} from 'lucide-react';
import { HealthMetrics } from '@/services/healthDataService';

interface HealthMetricsGridProps {
  healthData: HealthMetrics;
  lastUpdated: Date | null;
}

const HealthMetricsGrid = ({ healthData, lastUpdated }: HealthMetricsGridProps) => {
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default HealthMetricsGrid;
