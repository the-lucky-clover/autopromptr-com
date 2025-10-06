import { useState, useCallback } from 'react';
import { Batch } from '@/types/batch';
import { BrowserAutomationService } from '@/services/automation/browserAutomation';
import { useToast } from '@/hooks/use-toast';

export function useRealBatchAutomation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  
  const { toast } = useToast();
  const automationService = new BrowserAutomationService();

  const runBatch = useCallback(async (batch: Batch): Promise<void> => {
    if (!batch || !batch.prompts || batch.prompts.length === 0) {
      throw new Error('Invalid batch: No prompts provided');
    }

    if (!batch.targetUrl) {
      throw new Error('Invalid batch: No target URL provided');
    }

    setLoading(true);
    setError(null);
    setProgress({ completed: 0, total: batch.prompts.length });

    try {
      console.log('🚀 Starting real batch automation for:', batch.name);

      // Decide route: local companion vs remote backend
      const target = (batch.targetUrl || '').toLowerCase();
      const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/.test(target);
      const isRemotePlatform = /(replit\.com|codesandbox\.io|glitch\.com|v0\.dev|lovable\.dev)/.test(target);

      if (isLocal) {
        const { localCompanionService } = await import('@/services/localCompanionService');
        const info = await localCompanionService.checkCompanionAvailability();
        if (!info.available) throw new Error('Local companion not available. Please start the AutoPromptr Companion app.');
        const res = await localCompanionService.sendBatchToLocalTool(batch, 'local-tool');
        if (!res.success) throw new Error(res.error || 'Local prompt injection failed');
        setProgress({ completed: batch.prompts.length, total: batch.prompts.length });
        toast({ title: 'Local Injection Started', description: 'Your local tool is processing the prompts.' });
        return;
      }

      if (isRemotePlatform) {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('prompt-dispatch', {
          body: { batch, platform: 'web-remote', options: batch.settings || {} },
        });
        if (error) throw new Error(error.message || 'Remote dispatch failed');
        setProgress({ completed: batch.prompts.length, total: batch.prompts.length });
        toast({ title: 'Remote Injection Started', description: 'Batch dispatched to automation backend.' });
        return;
      }

      // Default: built-in browser automation path
      const isHealthy = await automationService.healthCheck();
      if (!isHealthy) {
        throw new Error('Backend automation service is not available. Please check the service status.');
      }

      const result = await automationService.processBatch(batch, {
        maxRetries: batch.settings?.maxRetries || 3,
        waitForIdle: batch.settings?.waitForIdle !== false,
        timeout: batch.settings?.elementTimeout || 30000,
        debugLevel: batch.settings?.debugLevel || 'standard'
      });

      console.log('✅ Batch automation completed:', result);
      setProgress({ completed: batch.prompts.length, total: batch.prompts.length });
      toast({ title: 'Batch Completed', description: `Successfully processed ${batch.prompts.length} prompts for "${batch.name}"` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown automation error';
      setError(errorMessage);
      console.error('❌ Batch automation failed:', err);
      toast({ title: 'Batch Failed', description: errorMessage, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const testConnection = useCallback(async (targetUrl: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await automationService.testConnection(targetUrl);
      
      if (result) {
        toast({
          title: 'Connection Test Successful',
          description: `Successfully connected to ${targetUrl}`,
        });
      } else {
        toast({
          title: 'Connection Test Failed',
          description: `Failed to connect to ${targetUrl}`,
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      toast({
        title: 'Connection Test Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    progress,
    runBatch,
    testConnection,
    clearError: () => setError(null)
  };
}