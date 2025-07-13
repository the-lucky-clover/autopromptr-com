
// Hybrid hook that works with both Lovable and Cloudflare systems
import { useState, useCallback } from 'react';
import { Batch } from '@/types/batch';
import { useToast } from '@/hooks/use-toast';
import { getActiveConfig } from '@/services/cloudflare/config';
import { CloudflareAutoPromptr } from '@/services/cloudflare/workers/autoPromptr';
import { AutoPromptr } from '@/services/autoPromptr/client';

export const useHybridBatchOperations = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const { toast } = useToast();

  const getClient = useCallback(() => {
    const config = getActiveConfig();
    
    if (config.useCloudflare) {
      console.log('🔄 Using Cloudflare Workers client');
      return new CloudflareAutoPromptr();
    } else {
      console.log('🔄 Using Lovable AutoPromptr client');
      return new AutoPromptr();
    }
  }, []);

  const handleRunBatch = useCallback(async (batch: Batch) => {
    const config = getActiveConfig();
    console.log(`🚀 Running batch via ${config.environment}:`, batch.name);
    
    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    setAutomationError(null);

    try {
      const client = getClient();
      const platform = batch.platform || 'web';
      
      // If parallel processing is enabled, run on both systems
      if (config.useLovable && config.useCloudflare && 
          import.meta.env.VITE_PARALLEL_PROCESSING === 'true') {
        
        console.log('🔄 Running batch in parallel mode');
        
        const lovableClient = new AutoPromptr();
        const cloudflareClient = new CloudflareAutoPromptr();
        
        const [lovableResult, cloudflareResult] = await Promise.allSettled([
          lovableClient.runBatch(batch, platform),
          cloudflareClient.runBatch(batch, platform)
        ]);
        
        console.log('Lovable result:', lovableResult);
        console.log('Cloudflare result:', cloudflareResult);
        
        toast({
          title: 'Parallel Processing Complete',
          description: `Batch processed on both Lovable and Cloudflare systems`,
        });
        
      } else {
        // Single system processing
        await client.runBatch(batch, platform);
        
        toast({
          title: 'Batch Started',
          description: `"${batch.name}" started via ${config.environment}`,
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAutomationError(errorMessage);
      
      toast({
        title: 'Batch Failed',
        description: `Error: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setAutomationLoading(false);
    }
  }, [getClient, toast]);

  const handleStopBatch = useCallback(async (batch: Batch) => {
    try {
      const client = getClient();
      await client.stopBatch(batch.id);
      
      toast({
        title: 'Batch Stopped',
        description: `"${batch.name}" has been stopped.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error Stopping Batch',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [getClient, toast]);

  return {
    selectedBatchId,
    automationLoading,
    automationError,
    handleRunBatch,
    handleStopBatch,
    getActiveConfig: getActiveConfig()
  };
};
