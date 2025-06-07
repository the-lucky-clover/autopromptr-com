import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { Batch } from '@/types/batch';
import { AutoPromptr } from '@/services/autoPromptr';

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

  const checkLovableSupabaseHandshake = async () => {
    try {
      addLog('info', 'Lovable-Supabase', 'Testing connection handshake...');
      
      // Test Supabase connection
      const response = await fetch('https://raahpoyciwuyhwlcenpy.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWhwb3ljaXd1eWh3bGNlbnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njc4NTAsImV4cCI6MjA2NDU0Mzg1MH0.lAzBUV4PumqVGQqJNhS-5snJIt_qnSAARSYKb5WEUQo'
        }
      });
      
      if (response.ok) {
        setSystemStatus(prev => ({ ...prev, lovableSupabase: 'connected' }));
        addLog('success', 'Lovable-Supabase', 'Connection established successfully', `Status: ${response.status}`);
      } else {
        setSystemStatus(prev => ({ ...prev, lovableSupabase: 'error' }));
        addLog('error', 'Lovable-Supabase', 'Connection failed', `Status: ${response.status}`);
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, lovableSupabase: 'error' }));
      addLog('error', 'Lovable-Supabase', 'Connection error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const checkSupabaseRenderHandshake = async () => {
    try {
      addLog('info', 'Supabase-Render', 'Testing backend connection...');
      
      const autoPromptr = new AutoPromptr();
      const healthCheck = await autoPromptr.healthCheck();
      
      setSystemStatus(prev => ({ ...prev, supabaseRender: 'connected' }));
      addLog('success', 'Supabase-Render', 'Backend connection established', `Health check: ${JSON.stringify(healthCheck)}`);
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, supabaseRender: 'error' }));
      addLog('error', 'Supabase-Render', 'Backend connection failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const checkRenderTargetHandshake = async () => {
    try {
      addLog('info', 'Render-Target', 'Testing target URL connections...');
      
      // Get unique target URLs from batches
      const targetUrls = [...new Set(batches.map(batch => batch.targetUrl).filter(Boolean))];
      
      if (targetUrls.length === 0) {
        addLog('warning', 'Render-Target', 'No target URLs to test', 'Create a batch with a target URL first');
        return;
      }

      for (const url of targetUrls) {
        try {
          // Basic connectivity test (note: CORS may block this, but we'll log the attempt)
          const response = await fetch(url, { mode: 'no-cors' });
          addLog('info', 'Render-Target', `Testing connectivity to ${url}`, 'CORS may prevent full validation');
        } catch (error) {
          addLog('warning', 'Render-Target', `Cannot directly test ${url}`, 'CORS restrictions - backend will handle actual connections');
        }
      }
      
      setSystemStatus(prev => ({ ...prev, renderTarget: 'tested' }));
      addLog('success', 'Render-Target', 'Target URL testing completed', `Tested ${targetUrls.length} unique URLs`);
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, renderTarget: 'error' }));
      addLog('error', 'Render-Target', 'Target URL testing failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runSystemDiagnostics = async () => {
    if (!hasActiveBatch) {
      addLog('info', 'System', 'No active batches - skipping system diagnostics');
      return;
    }

    setIsRefreshing(true);
    addLog('info', 'System', 'Starting system diagnostics for active batch processing...');
    
    await checkLovableSupabaseHandshake();
    await checkSupabaseRenderHandshake();
    await checkRenderTargetHandshake();
    
    addLog('success', 'System', 'System diagnostics completed');
    setIsRefreshing(false);
  };

  // Only run diagnostics when there are active batches
  useEffect(() => {
    if (hasActiveBatch) {
      addLog('info', 'System', 'Active batch detected - initializing system diagnostics...');
      runSystemDiagnostics();
    } else {
      addLog('info', 'System', 'No active batches - system in standby mode');
    }
  }, [hasActiveBatch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'tested':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-300">Connected</Badge>;
      case 'tested':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Tested</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-300">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Standby</Badge>;
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

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
            onClick={runSystemDiagnostics}
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
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Lovable ↔ Supabase</span>
              {getStatusIcon(systemStatus.lovableSupabase)}
            </div>
            {getStatusBadge(systemStatus.lovableSupabase)}
          </div>
          
          <div className="bg-white/5 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Supabase ↔ Render.com</span>
              {getStatusIcon(systemStatus.supabaseRender)}
            </div>
            {getStatusBadge(systemStatus.supabaseRender)}
          </div>
          
          <div className="bg-white/5 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Render ↔ Target URLs</span>
              {getStatusIcon(systemStatus.renderTarget)}
            </div>
            {getStatusBadge(systemStatus.renderTarget)}
          </div>
        </div>

        {/* Logs */}
        <div>
          <h4 className="text-white font-medium mb-3">System Logs</h4>
          <ScrollArea className="h-64 bg-white/5 rounded-xl p-3">
            {logs.length === 0 ? (
              <p className="text-white/60 text-sm">
                {hasActiveBatch 
                  ? "Starting diagnostics for active batch..." 
                  : "No active batches. System logs will appear when batches are being processed."}
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 text-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/80 font-medium">[{log.system}]</span>
                        <span className="text-white/60 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white/90">{log.message}</p>
                      {log.details && (
                        <p className="text-white/60 text-xs mt-1">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogsPanel;
