
import { useState, useCallback } from 'react';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useToast } from '@/hooks/use-toast';
import { useBatchDatabase } from '@/hooks/useBatchDatabase';
import { useRealBatchAutomation } from '@/hooks/useRealBatchAutomation';

export const useBatchOperations = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);

  const { toast } = useToast();
  const { saveBatchToDatabase } = useBatchDatabase();
  const { runBatch: runRealBatchAutomation, loading: realAutomationLoading, error: realAutomationError } = useRealBatchAutomation();

  const handleRunBatch = useCallback(async (batch: Batch) => {
    const targetUrl = batch.targetUrl?.trim();
    
    if (!targetUrl) {
      toast({
        title: 'Missing Target URL',
        description: 'Please provide a target URL for automation.',
        variant: 'destructive',
      });
      return;
    }

    if (!batch.prompts || batch.prompts.length === 0) {
      toast({
        title: 'No Prompts to Process',
        description: 'Please add at least one prompt to the batch.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    setAutomationError(null);

    try {
      console.log('🚀 Starting real browser automation for batch:', batch.name);
      
      // Update batch status to running
      setBatches(prev =>
        prev.map(b => b.id === batch.id
          ? { ...b, status: 'running' }
          : b)
      );

      // Run the actual automation
      await runRealBatchAutomation(batch);

      // Update batch status to completed
      setBatches(prev =>
        prev.map(b => b.id === batch.id
          ? { ...b, status: 'completed' }
          : b)
      );

      toast({
        title: 'Batch Completed Successfully',
        description: `"${batch.name}" has finished processing all prompts.`,
      });

    } catch (error) {
      console.error('❌ Batch automation failed:', error);
      
      // Update batch status to failed
      setBatches(prev =>
        prev.map(b => b.id === batch.id
          ? { ...b, status: 'failed' }
          : b)
      );

      const errorMessage = error instanceof Error ? error.message : 'Unknown automation error';
      setAutomationError(errorMessage);

      toast({
        title: 'Batch Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAutomationLoading(false);
    }
  }, [toast, runRealBatchAutomation, setBatches]);

  const handleStopBatch = useCallback((batch: Batch) => {
    setBatches(prev =>
      prev.map(b => b.id === batch.id ? { ...b, status: 'stopped' } : b)
    );
    setSelectedBatchId(null);
    setAutomationLoading(false);
  }, []);

  const createBatch = useCallback(async (batchData: any) => {
    const detectedPlatform = detectPlatformFromUrl(batchData.targetUrl);
    
    const newBatch: Batch = {
      id: crypto.randomUUID(),
      name: batchData.name,
      targetUrl: batchData.targetUrl,
      description: batchData.description || '',
      prompts: batchData.initialPrompt ? [{
        id: crypto.randomUUID(),
        text: batchData.initialPrompt,
        order: 0
      }] : [],
      status: 'pending',
      createdAt: new Date(),
      platform: detectedPlatform,
      settings: {
        waitForIdle: batchData.waitForIdle ?? true,
        maxRetries: batchData.maxRetries ?? 3,
      },
    };

    try {
      await saveBatchToDatabase(newBatch);
      setBatches(prev => [...prev, newBatch]);
      toast({
        title: 'Batch created successfully',
        description: `Batch "${newBatch.name}" created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to create batch',
        description: 'There was an error creating the batch.',
        variant: 'destructive',
      });
    }
  }, [saveBatchToDatabase, toast]);

  const deleteBatch = useCallback((batchId: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
  }, [selectedBatchId]);

  const updatePrompt = useCallback((batchId: string, promptId: string, text: string) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? {
              ...batch,
              prompts: batch.prompts.map(prompt =>
                prompt.id === promptId ? { ...prompt, text } : prompt
              )
            }
          : batch
      )
    );
  }, []);

  const deletePrompt = useCallback((batchId: string, promptId: string) => {
    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? {
              ...batch,
              prompts: batch.prompts.filter(prompt => prompt.id !== promptId)
            }
          : batch
      )
    );
  }, []);

  const addPromptToBatch = useCallback((batchId: string) => {
    const newPrompt = {
      id: crypto.randomUUID(),
      text: '',
      order: Date.now()
    };

    setBatches(prev =>
      prev.map(batch =>
        batch.id === batchId
          ? { ...batch, prompts: [...batch.prompts, newPrompt] }
          : batch
      )
    );
  }, []);

  return {
    batches,
    setBatches,
    selectedBatchId,
    batchStatus,
    automationLoading,
    automationError,
    createBatch,
    deleteBatch,
    handleRunBatch,
    handleStopBatch,
    updatePrompt,
    deletePrompt,
    addPromptToBatch,
  };
};
