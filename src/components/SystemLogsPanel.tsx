
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Info } from 'lucide-react';
import { Batch } from '@/types/batch';
import SystemStatusOverview from './SystemStatusOverview';
import SystemLogsDisplay from './SystemLogsDisplay';
import RenderSyslogDisplay from './RenderSyslogDisplay';
import { useSystemDiagnostics } from './SystemDiagnostics';

interface SystemLogsProps {
  batches: Batch[];
  hasActiveBatch: boolean;
  isCompact?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  system: string;
  message: string;
  details?: string;
}

const SystemLogsPanel = ({ batches, hasActiveBatch, isCompact = false }: SystemLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    lovableSupabase: 'unknown',
    supabaseRender: 'unknown',
    renderTarget: 'unknown'
  });

  // Get the active batch ID for filtering syslog entries
  const activeBatchId = batches.find(batch => batch.status === 'running')?.id || null;

  const addLog = (type: LogEntry['type'], system: string, message: string, details?: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      system,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const { runSystemDiagnostics } = useSystemDiagnostics({
    batches,
    addLog,
    setSystemStatus
  });

  const handleRefreshDiagnostics = async () => {
    if (!hasActiveBatch) {
      addLog('info', 'System', 'No active batches - skipping system diagnostics');
      return;
    }

    setIsRefreshing(true);
    await runSystemDiagnostics(hasActiveBatch);
    setIsRefreshing(false);
  };

  // Only run diagnostics when there are active batches
  useEffect(() => {
    if (hasActiveBatch) {
      addLog('info', 'System', 'Active batch detected - initializing system diagnostics...');
      handleRefreshDiagnostics();
    } else {
      addLog('info', 'System', 'No active batches - system in standby mode');
    }
  }, [hasActiveBatch]);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className={isCompact ? "pb-2" : "pb-4"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-white ${isCompact ? 'text-sm' : 'text-base'}`}>
              System Diagnostics & Logs
            </CardTitle>
            <CardDescription className={`text-purple-200 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {hasActiveBatch 
                ? "Real-time monitoring of system handshakes and render logs during batch processing" 
                : "System in standby mode - diagnostics will run when batches are active"}
            </CardDescription>
          </div>
          <Button
            onClick={handleRefreshDiagnostics}
            disabled={isRefreshing || !hasActiveBatch}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {hasActiveBatch ? 'Refresh' : 'No Active Batch'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`space-y-5 ${isCompact ? 'space-y-3' : ''}`}>
        <SystemStatusOverview systemStatus={systemStatus} />
        
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-4">
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-white/20">
              System Logs
            </TabsTrigger>
            <TabsTrigger value="render" className="text-white data-[state=active]:bg-white/20">
              Render Syslog
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="mt-0">
            <SystemLogsDisplay logs={logs} hasActiveBatch={hasActiveBatch} />
          </TabsContent>
          
          <TabsContent value="render" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white/80 text-sm bg-white/5 rounded-lg p-3">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                  Syslog endpoint: raahpoyciwuyhwlcenpy.supabase.co:443
                </span>
              </div>
              <RenderSyslogDisplay batchId={activeBatchId} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
