
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';
import { cloudflare } from '@/integrations/cloudflare/client';

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
  const checkCloudflareConnection = async () => {
    try {
      addLog('info', 'Cloudflare-D1', 'Testing connection...');
      
      // Test Cloudflare D1 connection using the configured client
      const { data, error } = await cloudflare.from('profiles').select('id').limit(1);
      
      if (!error) {
        setSystemStatus((prev: any) => ({ ...prev, cloudflareD1: 'connected' }));
        addLog('success', 'Cloudflare-D1', 'Connection established successfully', 'Database accessible');
      } else {
        setSystemStatus((prev: any) => ({ ...prev, cloudflareD1: 'error' }));
        addLog('error', 'Cloudflare-D1', 'Connection failed', error.message);
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
      
      // Validate URL format before testing
      try {
        new URL(targetUrl);
      } catch {
        addLog('error', 'Render-Target', 'Invalid URL format', `URL: ${targetUrl}`);
        setSystemStatus((prev: any) => ({ ...prev, renderTarget: 'error' }));
        return;
      }
      
      // Basic connectivity test (note: CORS may block this, but we'll log the attempt)
      try {
        const response = await fetch(targetUrl, { 
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
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
