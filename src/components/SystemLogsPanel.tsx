
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Terminal, FileText, Activity, AlertCircle } from 'lucide-react';
import SystemLogsDisplay from './SystemLogsDisplay';
import RenderSyslogDisplay from './RenderSyslogDisplay';

interface SystemLogsPanelProps {
  batches: any[];
  hasActiveBatch: boolean;
  isCompact?: boolean;
}

const SystemLogsPanel = ({ batches, hasActiveBatch, isCompact = false }: SystemLogsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'system' | 'syslog'>('system');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    // Simulate log count updates
    const interval = setInterval(() => {
      setLogCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (isCompact) {
    return (
      <Card className="dashboard-module-lg bg-white/5 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-blue-400" />
              System Diagnostics & Logs
            </CardTitle>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-white hover:bg-white/20 press-effect click-feedback"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveTab('system')}
              size="sm"
              variant={activeTab === 'system' ? 'default' : 'ghost'}
              className={`text-xs h-6 px-2 press-effect ${
                activeTab === 'system' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Terminal className="w-3 h-3 mr-1" />
              System Logs
            </Button>
            <Button
              onClick={() => setActiveTab('syslog')}
              size="sm"
              variant={activeTab === 'syslog' ? 'default' : 'ghost'}
              className={`text-xs h-6 px-2 press-effect ${
                activeTab === 'syslog' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <FileText className="w-3 h-3 mr-1" />
              Render SysLog
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden dashboard-module-content">
          {activeTab === 'system' ? (
            <SystemLogsDisplay batches={batches} isCompact={true} />
          ) : (
            <RenderSyslogDisplay isCompact={true} />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <span>System Diagnostics & Logs</span>
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Activity className="w-3 h-3 mr-1" />
              {logCount} entries
            </Badge>
            {hasActiveBatch && (
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveTab('system')}
            size="sm"
            variant={activeTab === 'system' ? 'default' : 'ghost'}
            className={`${
              activeTab === 'system' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            } rounded-xl`}
          >
            <Terminal className="w-4 h-4 mr-2" />
            System Logs
          </Button>
          <Button
            onClick={() => setActiveTab('syslog')}
            size="sm"
            variant={activeTab === 'syslog' ? 'default' : 'ghost'}
            className={`${
              activeTab === 'syslog' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            } rounded-xl`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Render SysLog
          </Button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'system' ? (
            <SystemLogsDisplay batches={batches} />
          ) : (
            <RenderSyslogDisplay />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
