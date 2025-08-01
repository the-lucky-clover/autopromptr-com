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
      
      // Test connection first
      const isHealthy = await automationService.healthCheck();
      if (!isHealthy) {
        throw new Error('Backend automation service is not available. Please check the service status.');
      }

      // Process the batch
      const result = await automationService.processBatch(batch, {
        maxRetries: batch.settings?.maxRetries || 3,
        waitForIdle: batch.settings?.waitForIdle !== false,
        timeout: batch.settings?.elementTimeout || 30000,
        debugLevel: batch.settings?.debugLevel || 'standard'
      });

      console.log('✅ Batch automation completed:', result);
      
      setProgress({ completed: batch.prompts.length, total: batch.prompts.length });
      
      toast({
        title: 'Batch Completed',
        description: `Successfully processed ${batch.prompts.length} prompts for "${batch.name}"`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown automation error';
      setError(errorMessage);
      
      console.error('❌ Batch automation failed:', err);
      
      toast({
        title: 'Batch Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
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