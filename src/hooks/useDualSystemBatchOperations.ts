// Dual System Batch Operations - Parallel compatibility with Lovable/Render and Cloudflare
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { getActiveConfig } from '@/services/cloudflare/config';
import { CloudflareAutoPromptr } from '@/services/cloudflare/workers/autoPromptr';
import { AutoPromptr } from '@/services/autoPromptr/client';

export const useDualSystemBatchOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    cloudflare?: any;
    render?: any;
    errors?: any;
  }>({});
  const { toast } = useToast();

  const runBatchWithDualSystem = useCallback(async (
    batch: Batch,
    platform: string,
    options?: {
      parallelProcessing?: boolean;
      fallbackEnabled?: boolean;
      compareResults?: boolean;
    }
  ) => {
    const config = getActiveConfig();
    const { 
      parallelProcessing = false,
      fallbackEnabled = true,
      compareResults = false 
    } = options || {};

    setIsProcessing(true);
    setResults({});

    try {
      if (parallelProcessing && config.useCloudflare && config.useLovable) {
        // Run both systems in parallel for comparison
        console.log('🔄 Running batch on both systems in parallel...');
        
        const cloudflareClient = new CloudflareAutoPromptr();
        const renderClient = new AutoPromptr();

        const [cloudflareResult, renderResult] = await Promise.allSettled([
          cloudflareClient.runBatch(batch, platform, options),
          renderClient.runBatch(batch, platform, options)
        ]);

        const results = {
          cloudflare: cloudflareResult.status === 'fulfilled' ? cloudflareResult.value : null,
          render: renderResult.status === 'fulfilled' ? renderResult.value : null,
          errors: {
            cloudflare: cloudflareResult.status === 'rejected' ? cloudflareResult.reason : null,
            render: renderResult.status === 'rejected' ? renderResult.reason : null,
          }
        };

        setResults(results);

        if (compareResults && results.cloudflare && results.render) {
          console.log('📊 Comparing results from both systems:', {
            cloudflare: results.cloudflare,
            render: results.render
          });
        }

        // Return the successful result or the primary system's result
        if (results.cloudflare) {
          toast({
            title: "Batch completed (Cloudflare)",
            description: `Batch "${batch.name}" processed successfully on Cloudflare.`,
          });
          return results.cloudflare;
        } else if (results.render) {
          toast({
            title: "Batch completed (Render)",
            description: `Batch "${batch.name}" processed successfully on Render.`,
          });
          return results.render;
        } else {
          throw new Error('Both systems failed to process the batch');
        }

      } else if (config.useCloudflare) {
        // Use Cloudflare Workers primarily
        console.log('☁️ Running batch on Cloudflare Workers...');
        
        try {
          const cloudflareClient = new CloudflareAutoPromptr();
          const result = await cloudflareClient.runBatch(batch, platform, options);
          
          setResults({ cloudflare: result });
          toast({
            title: "Batch completed",
            description: `Batch "${batch.name}" completed successfully on Cloudflare.`,
          });
          
          return result;
        } catch (error) {
          if (fallbackEnabled && config.useLovable) {
            console.log('⚠️ Cloudflare failed, falling back to Render...');
            const renderClient = new AutoPromptr();
            const result = await renderClient.runBatch(batch, platform, options);
            
            setResults({ render: result, errors: { cloudflare: error } });
            toast({
              title: "Batch completed (Fallback)",
              description: `Batch "${batch.name}" completed on Render after Cloudflare failure.`,
            });
            
            return result;
          }
          throw error;
        }

      } else {
        // Use Render.com/Lovable system
        console.log('🔧 Running batch on Render.com backend...');
        
        const renderClient = new AutoPromptr();
        const result = await renderClient.runBatch(batch, platform, options);
        
        setResults({ render: result });
        toast({
          title: "Batch completed",
          description: `Batch "${batch.name}" completed successfully.`,
        });
        
        return result;
      }

    } catch (error) {
      console.error('Dual system batch operation failed:', error);
      
      setResults(prev => ({
        ...prev,
        errors: { ...prev.errors, general: error }
      }));

      toast({
        title: "Batch failed",
        description: `Batch "${batch.name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const stopBatchOnAllSystems = useCallback(async (batchId: string) => {
    const config = getActiveConfig();
    
    try {
      const promises = [];
      
      if (config.useCloudflare) {
        const cloudflareClient = new CloudflareAutoPromptr();
        promises.push(
          cloudflareClient.stopBatch(batchId).catch(error => ({ system: 'cloudflare', error }))
        );
      }
      
      if (config.useLovable) {
        const renderClient = new AutoPromptr();
        promises.push(
          renderClient.stopBatch(batchId).catch(error => ({ system: 'render', error }))
        );
      }

      const results = await Promise.allSettled(promises);
      
      toast({
        title: "Batch stopped",
        description: `Batch ${batchId} stop request sent to all systems.`,
      });

      return results;
    } catch (error) {
      console.error('Failed to stop batch on all systems:', error);
      toast({
        title: "Error stopping batch",
        description: `Failed to stop batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const getSystemStatus = useCallback(async () => {
    const config = getActiveConfig();
    const status = {
      cloudflare: { available: false, healthy: false },
      render: { available: false, healthy: false },
      environment: config.environment
    };

    try {
      if (config.useCloudflare) {
        const cloudflareClient = new CloudflareAutoPromptr();
        const health = await cloudflareClient.healthCheck();
        status.cloudflare = { available: true, healthy: !!health };
      }
    } catch (error) {
      console.warn('Cloudflare health check failed:', error);
    }

    try {
      if (config.useLovable) {
        const renderClient = new AutoPromptr();
        const health = await renderClient.healthCheck();
        status.render = { available: true, healthy: !!health };
      }
    } catch (error) {
      console.warn('Render health check failed:', error);
    }

    return status;
  }, []);

  return {
    isProcessing,
    results,
    runBatchWithDualSystem,
    stopBatchOnAllSystems,
    getSystemStatus
  };
};