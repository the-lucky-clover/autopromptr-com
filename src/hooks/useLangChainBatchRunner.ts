
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LangChainClient } from '@/services/langchain/langchainClient';
import { LangChainBatchProcessor } from '@/services/langchain/batchProcessor';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useLangChainBatchRunner = () => {
  const { toast } = useToast();
  const { saveBatchToDatabase } = useBatchDatabase();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);

  const handleRunBatchWithLangChain = async (
    batch: Batch, 
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void,
    apiKey?: string
  ) => {
    const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!detectedPlatform) {
      toast({
        title: "Cannot detect platform",
        description: "Unable to determine platform from the target URL. Please check the URL format.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "OpenAI API key is required for LangChain processing. Please configure it in settings.",
        variant: "destructive",
      });
      return;
    }

    // Check if any batch is already running
    const runningBatch = await new Promise<Batch[]>((resolve) => {
      setBatches(prev => {
        const running = prev.filter(b => b.status === 'running');
        resolve(running);
        return prev;
      });
    });

    if (runningBatch.length > 0) {
      toast({
        title: "Batch already running",
        description: `Cannot start "${batch.name}" because "${runningBatch[0].name}" is already processing.`,
        variant: "destructive",
      });
      return;
    }

    console.log('🔗 Starting LangChain batch processing for:', batch.id);

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to pending
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'pending' as const, errorMessage: undefined } : b
      ));

      // Enhanced settings for LangChain processing
      const enhancedSettings = {
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: Math.max(batch.settings?.maxRetries ?? 2, 2),
        automationDelay: batch.settings?.automationDelay ?? 3000,
        elementTimeout: batch.settings?.elementTimeout ?? 30000,
        debugLevel: batch.settings?.debugLevel ?? 'detailed'
      };

      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        settings: enhancedSettings,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('💾 Saving batch to database...');
      const saveResult = await saveBatchToDatabase(batchToRun);
      
      if (!saveResult) {
        throw new Error('Failed to save batch to database');
      }
      
      // Update to running status
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: 'running' as const, 
          platform: detectedPlatform, 
          settings: enhancedSettings,
          errorMessage: undefined
        } : b
      ));
      
      // Initialize LangChain client and processor
      const langchainClient = new LangChainClient({
        apiKey,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxRetries: 3
      });
      
      const batchProcessor = new LangChainBatchProcessor(langchainClient, {
        waitBetweenPrompts: enhancedSettings.automationDelay,
        maxWaitForTarget: enhancedSettings.elementTimeout,
        retryFailedPrompts: true,
        maxRetries: enhancedSettings.maxRetries
      });
      
      console.log('🎯 Starting LangChain batch processing...');
      const results = await batchProcessor.processBatch(batchToRun);
      
      // Determine final status based on results
      const successCount = results.filter(r => r.success).length;
      const finalStatus = successCount === results.length ? 'completed' : 
                         successCount > 0 ? 'completed' : 'failed';
      
      // Update batch status
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: finalStatus as const,
          errorMessage: finalStatus === 'failed' ? 'Some prompts failed processing' : undefined
        } : b
      ));
      
      // Save final status to database
      const finalBatch = { ...batchToRun, status: finalStatus as const };
      await saveBatchToDatabase(finalBatch);
      
      console.log('🎉 LangChain batch processing completed:', results);
      
      toast({
        title: "LangChain batch processing completed",
        description: `Processed "${batch.name}" using ${platformName}. Success: ${successCount}/${results.length} prompts.`,
      });
      
    } catch (err) {
      console.error('💥 LangChain batch processing failed:', err);
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Update batch status to failed with error message
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: 'failed' as const,
          errorMessage: errorMessage
        } : b
      ));
      
      // Save failed status to database
      try {
        const failedBatch = {
          ...batch,
          status: 'failed' as const,
          errorMessage: errorMessage,
          platform: detectedPlatform
        };
        await saveBatchToDatabase(failedBatch);
      } catch (saveError) {
        console.error('Failed to save failed batch status to database:', saveError);
      }
      
      toast({
        title: "LangChain batch processing failed",
        description: `Processing failed: ${errorMessage}`,
        variant: "destructive",
      });
      
    } finally {
      setAutomationLoading(false);
    }
  };

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatchWithLangChain
  };
};
