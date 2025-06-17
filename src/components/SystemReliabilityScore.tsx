
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemReliabilityScoreProps {
  className?: string;
  isCompact?: boolean;
}

const SystemReliabilityScore = ({ className = '', isCompact = false }: SystemReliabilityScoreProps) => {
  const score = 99.999; // Five 9's reliability - stable score
  const status = 'Excellent';

  if (isCompact) {
    return (
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium text-xs">System Score</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {score}%
          </div>
        </div>

        <div className="text-center">
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>

        {/* Compact Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-green-400 text-xs font-semibold">99.999%</div>
            <div className="text-white/60 text-[10px]">Uptime</div>
          </div>
          <div>
            <div className="text-blue-400 text-xs font-semibold">Multi-AZ</div>
            <div className="text-white/60 text-[10px]">Redundancy</div>
          </div>
          <div>
            <div className="text-purple-400 text-xs font-semibold">24/7</div>
            <div className="text-white/60 text-[10px]">Monitoring</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20 rounded-xl`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>System Reliability</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-green-400">
            {score}%
          </div>
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-500/20">
            <CheckCircle className="w-4 h-4 mr-2" />
            All Systems Operational
          </Badge>
        </div>

        {/* Robustness Indicators */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-green-400 text-lg font-semibold flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              99.999%
            </div>
            <div className="text-white/60 text-xs">Uptime SLA</div>
          </div>
          <div className="space-y-1">
            <div className="text-blue-400 text-lg font-semibold flex items-center justify-center">
              <Zap className="w-4 h-4 mr-1" />
              Multi-AZ
            </div>
            <div className="text-white/60 text-xs">Redundancy</div>
          </div>
          <div className="space-y-1">
            <div className="text-purple-400 text-lg font-semibold flex items-center justify-center">
              <Activity className="w-4 h-4 mr-1" />
              24/7
            </div>
            <div className="text-white/60 text-xs">Monitoring</div>
          </div>
        </div>

        {/* System Features */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-white/80">
            <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
            <span>Automated failover & recovery</span>
          </div>
          <div className="flex items-center text-white/80">
            <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
            <span>Real-time health monitoring</span>
          </div>
          <div className="flex items-center text-white/80">
            <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
            <span>Geographic redundancy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemReliabilityScore;
