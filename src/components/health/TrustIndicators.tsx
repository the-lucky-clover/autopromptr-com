
import { Wifi, Activity, Zap } from 'lucide-react';

const TrustIndicators = () => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
    <div className="flex items-center justify-center space-x-6 text-xs">
      <div className="flex items-center space-x-1 text-green-400">
        <Wifi className="w-3 h-3" />
        <span>Smart Monitoring</span>
      </div>
      <div className="flex items-center space-x-1 text-blue-400">
        <Activity className="w-3 h-3" />
        <span>Circuit Breaker Protection</span>
      </div>
      <div className="flex items-center space-x-1 text-purple-400">
        <Zap className="w-3 h-3" />
        <span>Optimized Performance</span>
      </div>
    </div>
  </div>
);

export default TrustIndicators;
