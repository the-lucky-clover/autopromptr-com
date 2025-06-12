
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsModuleProps {
  isCompact?: boolean;
}

const AnalyticsModule = ({ isCompact = false }: AnalyticsModuleProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  // Generate sample data
  useEffect(() => {
    const generateData = () => {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const data = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date.toISOString().split('T')[0],
          batchesCreated: Math.floor(Math.random() * 15) + 5,
          promptsProcessed: Math.floor(Math.random() * 200) + 50,
          successRate: Math.floor(Math.random() * 20) + 80,
        });
      }
      
      setChartData(data);
    };

    generateData();
  }, [timeframe]);

  const totalBatches = chartData.reduce((sum, item) => sum + item.batchesCreated, 0);
  const totalPrompts = chartData.reduce((sum, item) => sum + item.promptsProcessed, 0);
  const avgSuccessRate = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.successRate, 0) / chartData.length)
    : 0;

  if (isCompact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3 h-3 text-purple-400" />
            <span className="text-white font-medium text-xs">Analytics</span>
          </div>
          <div className="flex space-x-1">
            {['7d', '30d', '90d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as '7d' | '30d' | '90d')}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  timeframe === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-blue-400 text-xs font-semibold">{totalBatches}</div>
            <div className="text-white/60 text-[10px]">Batches</div>
          </div>
          <div>
            <div className="text-green-400 text-xs font-semibold">{totalPrompts}</div>
            <div className="text-white/60 text-[10px]">Prompts</div>
          </div>
          <div>
            <div className="text-purple-400 text-xs font-semibold">{avgSuccessRate}%</div>
            <div className="text-white/60 text-[10px]">Success</div>
          </div>
        </div>

        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="batchesCreated" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>Analytics Overview</span>
          </CardTitle>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as '7d' | '30d' | '90d')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeframe === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-blue-400 text-2xl font-bold">{totalBatches}</div>
            <div className="text-white/60 text-sm">Batches Created</div>
          </div>
          <div className="space-y-1">
            <div className="text-green-400 text-2xl font-bold">{totalPrompts}</div>
            <div className="text-white/60 text-sm">Prompts Processed</div>
          </div>
          <div className="space-y-1">
            <div className="text-purple-400 text-2xl font-bold">{avgSuccessRate}%</div>
            <div className="text-white/60 text-sm">Success Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="batchesCreated" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Batches Created"
              />
              <Line 
                type="monotone" 
                dataKey="promptsProcessed" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Prompts Processed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">+23% increase from last period</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsModule;
