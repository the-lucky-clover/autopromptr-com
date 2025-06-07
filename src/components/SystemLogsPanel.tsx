
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Batch } from '@/types/batch';
import SystemStatusOverview from './SystemStatusOverview';
import SystemLogsDisplay from './SystemLogsDisplay';
import { useSystemDiagnostics } from './SystemDiagnostics';

interface SystemLogsProps {
  batches: Batch[];
  hasActiveBatch: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  system: string;
  message: string;
  details?: string;
}

const SystemLogsPanel = ({ batches, hasActiveBatch }: SystemLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    lovableSupabase: 'unknown',
    supabaseRender: 'unknown',
    renderTarget: 'unknown'
  });

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">System Diagnostics & Logs</CardTitle>
            <CardDescription className="text-purple-200">
              {hasActiveBatch 
                ? "Real-time monitoring of system handshakes during batch processing" 
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
      <CardContent className="space-y-4">
        <SystemStatusOverview systemStatus={systemStatus} />
        <SystemLogsDisplay logs={logs} hasActiveBatch={hasActiveBatch} />
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
