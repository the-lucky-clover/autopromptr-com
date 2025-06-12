
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';

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

  // Calculate angle for speedometer needle (0-180 degrees for half circle)
  const needleAngle = (score / 100) * 180;

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

        {/* Compact Speedometer */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-12">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Background Arc */}
              <path
                d="M 10 40 A 40 40 0 0 1 90 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              
              {/* Score Arc */}
              <path
                d="M 10 40 A 40 40 0 0 1 90 40"
                fill="none"
                stroke={score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 125.6} 125.6`}
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Needle */}
              <line
                x1="50"
                y1="40"
                x2="50"
                y2="20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${needleAngle - 90} 50 40)`}
                className="transition-transform duration-1000 ease-out"
                style={{ transformOrigin: '50px 40px' }}
              />
              
              {/* Center dot */}
              <circle cx="50" cy="40" r="2" fill="white" />
            </svg>
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
    <Card className={`${className} bg-white/10 backdrop-blur-sm border-white/20`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>System Reliability Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animated Speedometer */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-24">
            {/* Speedometer Base */}
            <svg
              viewBox="0 0 200 100"
              className="w-full h-full"
              style={{ transform: 'rotate(0deg)' }}
            >
              {/* Background Arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              
              {/* Score Arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke={score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Needle */}
              <line
                x1="100"
                y1="80"
                x2="100"
                y2="30"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${needleAngle - 90} 100 80)`}
                className="transition-transform duration-1000 ease-out"
                style={{ transformOrigin: '100px 80px' }}
              />
              
              {/* Center dot */}
              <circle
                cx="100"
                cy="80"
                r="4"
                fill="white"
              />
              
              {/* Scale markers */}
              {[0, 25, 50, 75, 100].map((value) => {
                const angle = (value / 100) * 180 - 90;
                const x1 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
                const y1 = 80 + 70 * Math.sin((angle * Math.PI) / 180);
                const x2 = 100 + 60 * Math.cos((angle * Math.PI) / 180);
                const y2 = 80 + 60 * Math.sin((angle * Math.PI) / 180);
                
                return (
                  <g key={value}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="2"
                    />
                    <text
                      x={100 + 55 * Math.cos((angle * Math.PI) / 180)}
                      y={80 + 55 * Math.sin((angle * Math.PI) / 180) + 3}
                      textAnchor="middle"
                      className="fill-white/60 text-xs font-medium"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-white/80 text-sm">
            {getScoreStatus(score)}
          </div>
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
