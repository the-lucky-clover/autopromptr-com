
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

  const checkRenderTargetHandshake = async (targetUrl: string) => {
    try {
      addLog('info', 'Render-Target', `Testing connectivity to target URL: ${targetUrl}...`);
      
      try {
        // Basic connectivity test (note: CORS may block this, but we'll log the attempt)
        const response = await fetch(targetUrl, { mode: 'no-cors' });
        addLog('info', 'Render-Target', `Testing connectivity to ${targetUrl}`, 'CORS may prevent full validation');
      } catch (error) {
        addLog('warning', 'Render-Target', `Cannot directly test ${targetUrl}`, 'CORS restrictions - backend will handle actual connections');
      }
      
      setSystemStatus((prev: any) => ({ ...prev, renderTarget: 'tested' }));
      addLog('success', 'Render-Target', `Target URL testing completed for ${targetUrl}`, 'Backend will handle actual automation connections');
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

    // Find the currently processing batch
    const processingBatch = batches.find(batch => batch.status === 'running');
    
    if (!processingBatch) {
      addLog('warning', 'System', 'No processing batch found despite hasActiveBatch being true');
      return;
    }

    addLog('info', 'System', `Starting system diagnostics for active batch: "${processingBatch.name}"...`);
    addLog('info', 'System', 'Backend URL configured: https://autopromptr-backend.onrender.com');
    
    await checkLovableSupabaseHandshake();
    await checkSupabaseRenderHandshake();
    
    // Only test the target URL of the currently processing batch
    if (processingBatch.targetUrl) {
      await checkRenderTargetHandshake(processingBatch.targetUrl);
    } else {
      addLog('warning', 'Render-Target', 'No target URL found for processing batch', `Batch: ${processingBatch.name}`);
    }
    
    addLog('success', 'System', `System diagnostics completed for batch: "${processingBatch.name}"`);
  };

  return {
    runSystemDiagnostics
  };
};
