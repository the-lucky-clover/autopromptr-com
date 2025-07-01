
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Activity, CheckCircle } from 'lucide-react';

interface DashboardStatsModuleProps {
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
  isCompact?: boolean;
}

const DashboardStatsModule = ({ stats, isCompact = false }: DashboardStatsModuleProps) => {
  const completionRate = stats.totalBatches > 0 ? Math.round((stats.completedBatches / stats.totalBatches) * 100) : 0;

  if (isCompact) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              {completionRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white text-lg font-bold">{stats.totalBatches}</p>
              <p className="text-white/60 text-xs">Batches</p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white text-lg font-bold">{stats.activeBatches}</p>
              <p className="text-white/60 text-xs">Active</p>
            </div>
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
            <BarChart3 className="w-5 h-5" />
            Statistics
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            {completionRate}% Success Rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{stats.totalBatches}</p>
            <p className="text-white/60 text-sm">Total Batches</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{stats.activeBatches}</p>
            <p className="text-white/60 text-sm">Active Batches</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{stats.completedBatches}</p>
            <p className="text-white/60 text-sm">Completed</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{stats.totalPrompts}</p>
            <p className="text-white/60 text-sm">Total Prompts</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">Completion Rate</span>
            <span className="text-white font-medium">{completionRate}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsModule;
