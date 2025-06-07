
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  system: string;
  message: string;
  details?: string;
}

interface SystemDiagnosticsProps {
  batches: Batch[];
  addLog: (type: LogEntry['type'], system: string, message: string, details?: string) => void;
  setSystemStatus: (status: any) => void;
}

export const useSystemDiagnostics = ({ batches, addLog, setSystemStatus }: SystemDiagnosticsProps) => {
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
        setSystemStatus((prev: any) => ({ ...prev, lovableSupabase: 'connected' }));
        addLog('success', 'Lovable-Supabase', 'Connection established successfully', `Status: ${response.status}`);
      } else {
        setSystemStatus((prev: any) => ({ ...prev, lovableSupabase: 'error' }));
        addLog('error', 'Lovable-Supabase', 'Connection failed', `Status: ${response.status}`);
      }
    } catch (error) {
      setSystemStatus((prev: any) => ({ ...prev, lovableSupabase: 'error' }));
      addLog('error', 'Lovable-Supabase', 'Connection error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const checkSupabaseRenderHandshake = async () => {
    try {
      addLog('info', 'Supabase-Render', 'Testing AutoPromptr backend connection at https://autopromptr-backend.onrender.com...');
      
      const autoPromptr = new AutoPromptr();
      const healthCheck = await autoPromptr.healthCheck();
      
      setSystemStatus((prev: any) => ({ ...prev, supabaseRender: 'connected' }));
      addLog('success', 'Supabase-Render', 'AutoPromptr backend connection established', `Health check: ${JSON.stringify(healthCheck)}`);
    } catch (error) {
      setSystemStatus((prev: any) => ({ ...prev, supabaseRender: 'error' }));
      addLog('error', 'Supabase-Render', 'AutoPromptr backend connection failed', error instanceof Error ? error.message : 'Render.com service may be sleeping - try running a batch to wake it up');
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
      
      setSystemStatus((prev: any) => ({ ...prev, renderTarget: 'tested' }));
      addLog('success', 'Render-Target', 'Target URL testing completed', `Tested ${targetUrls.length} unique URLs`);
    } catch (error) {
      setSystemStatus((prev: any) => ({ ...prev, renderTarget: 'error' }));
      addLog('error', 'Render-Target', 'Target URL testing failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runSystemDiagnostics = async (hasActiveBatch: boolean) => {
    if (!hasActiveBatch) {
      addLog('info', 'System', 'No active batches - skipping system diagnostics');
      return;
    }

    addLog('info', 'System', 'Starting system diagnostics for active batch processing...');
    addLog('info', 'System', 'Backend URL configured: https://autopromptr-backend.onrender.com');
    
    await checkLovableSupabaseHandshake();
    await checkSupabaseRenderHandshake();
    await checkRenderTargetHandshake();
    
    addLog('success', 'System', 'System diagnostics completed');
  };

  return {
    runSystemDiagnostics
  };
};
