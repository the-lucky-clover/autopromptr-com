
import { Shield, RefreshCw, TestTube, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SystemHealthHeaderProps {
  overallHealth: number;
  isRunning: boolean;
  isCompact?: boolean;
  onRefresh: () => void;
  onRunTests: () => void;
}

const SystemHealthHeader = ({ 
  overallHealth, 
  isRunning, 
  isCompact = false, 
  onRefresh, 
  onRunTests 
}: SystemHealthHeaderProps) => {
  if (isCompact) {
    return (
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-3 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="text-white font-semibold text-xs">System Health</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onRunTests}
              disabled={isRunning}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Run comprehensive tests"
            >
              <TestTube className={`w-3 h-3 text-blue-300 ${isRunning ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={onRefresh}
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
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">System Reliability Score</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRunTests}
            disabled={isRunning}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Run comprehensive tests"
          >
            <TestTube className={`w-4 h-4 text-blue-300 ${isRunning ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={onRefresh}
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
  );
};

export default SystemHealthHeader;
