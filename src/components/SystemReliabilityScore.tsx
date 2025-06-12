
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SystemReliabilityScoreProps {
  className?: string;
  isCompact?: boolean;
}

const SystemReliabilityScore = ({ className = '', isCompact = false }: SystemReliabilityScoreProps) => {
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(85);

  // Animate score on mount and when target changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore(prev => {
          if (prev < targetScore) {
            return Math.min(prev + 2, targetScore);
          }
          return targetScore;
        });
      }, 50);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, [targetScore]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newScore = Math.max(75, Math.min(95, 85 + Math.random() * 10 - 5));
      setTargetScore(Math.round(newScore));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Attention';
  };

  if (isCompact) {
    return (
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-white font-medium text-xs">System Score</span>
          </div>
          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-2">
          <Progress value={score} className="h-2 bg-white/10" />
          <div className="text-center text-xs text-white/60">
            {getScoreStatus(score)}
          </div>
        </div>

        {/* Compact Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-green-400 text-xs font-semibold">99.2%</div>
            <div className="text-white/60 text-[10px]">Uptime</div>
          </div>
          <div>
            <div className="text-blue-400 text-xs font-semibold">142ms</div>
            <div className="text-white/60 text-[10px]">Response</div>
          </div>
          <div>
            <div className="text-purple-400 text-xs font-semibold">0.03%</div>
            <div className="text-white/60 text-[10px]">Errors</div>
          </div>
        </div>

        {/* Compact Trend */}
        <div className="flex items-center justify-center space-x-1 text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs">+2.3%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20 rounded-xl`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>System Reliability Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display with Progress Bar */}
        <div className="text-center space-y-4">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-white/80 text-sm">
            {getScoreStatus(score)}
          </div>
          <Progress value={score} className="h-3 bg-white/10" />
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-green-400 text-lg font-semibold">99.2%</div>
            <div className="text-white/60 text-xs">Uptime</div>
          </div>
          <div className="space-y-1">
            <div className="text-blue-400 text-lg font-semibold">142ms</div>
            <div className="text-white/60 text-xs">Avg Response</div>
          </div>
          <div className="space-y-1">
            <div className="text-purple-400 text-lg font-semibold">0.03%</div>
            <div className="text-white/60 text-xs">Error Rate</div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">+2.3% from last hour</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemReliabilityScore;
