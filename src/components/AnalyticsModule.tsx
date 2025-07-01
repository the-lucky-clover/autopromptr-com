import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Zap, Globe } from 'lucide-react';

interface AnalyticsModuleProps {
  isCompact?: boolean;
}

const AnalyticsModule = ({ isCompact = false }: AnalyticsModuleProps) => {
  // Mock analytics data
  const chartData = [
    { name: 'Mon', batches: 12 },
    { name: 'Tue', batches: 8 },
    { name: 'Wed', batches: 15 },
    { name: 'Thu', batches: 10 },
    { name: 'Fri', batches: 18 },
    { name: 'Sat', batches: 6 },
    { name: 'Sun', batches: 9 },
  ];

  const pieData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'Running', value: 20, color: '#3b82f6' },
    { name: 'Failed', value: 10, color: '#ef4444' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
  ];

  const metrics = {
    totalUsers: 1247,
    activeToday: 89,
    processingTime: '2.3s',
    successRate: 94.2
  };

  if (isCompact) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              System Overview
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              {metrics.successRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white text-lg font-bold">{metrics.totalUsers}</p>
              <p className="text-white/60 text-xs">Users</p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-white text-lg font-bold">{metrics.activeToday}</p>
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
            <TrendingUp className="w-5 h-5" />
            System Overview
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Live Analytics
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{metrics.totalUsers}</p>
            <p className="text-white/60 text-sm">Total Users</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{metrics.activeToday}</p>
            <p className="text-white/60 text-sm">Active Today</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{metrics.processingTime}</p>
            <p className="text-white/60 text-sm">Avg Processing</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-white text-2xl font-bold">{metrics.successRate}%</p>
            <p className="text-white/60 text-sm">Success Rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-3">Weekly Batch Activity</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="batches" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-3">Batch Status Distribution</h4>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/60 text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsModule;
