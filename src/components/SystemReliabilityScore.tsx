
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemReliabilityScoreProps {
  isCompact?: boolean;
}

const SystemReliabilityScore = ({ isCompact = false }: SystemReliabilityScoreProps) => {
  // Mock reliability data
  const reliabilityScore = 94.5;
  const uptime = 99.8;
  const lastIncident = '12 days ago';
  const status = reliabilityScore >= 95 ? 'excellent' : reliabilityScore >= 85 ? 'good' : 'needs attention';

  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  if (isCompact) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Reliability
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              {reliabilityScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {reliabilityScore}%
            </div>
            <p className="text-white/60 text-xs">System Score</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Reliability Score
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={`${
              status === 'excellent' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
              status === 'good' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
              'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getStatusColor()}`}>
            {reliabilityScore}%
          </div>
          <p className="text-white/70">Overall System Reliability</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-white/60 text-sm">Uptime</p>
            <p className="text-white text-xl font-bold">{uptime}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-white/60 text-sm">Last Incident</p>
            <p className="text-white text-xl font-bold">{lastIncident}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Reliability Score</span>
            <span className="text-white font-medium">{reliabilityScore}/100</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${reliabilityScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-white/60 text-sm mb-1">System Status</p>
          <p className={`font-medium capitalize ${getStatusColor()}`}>
            {status === 'excellent' ? 'All systems operational' : 
             status === 'good' ? 'Minor issues detected' : 
             'Attention required'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemReliabilityScore;
