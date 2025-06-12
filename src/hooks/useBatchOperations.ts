
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchSync } from '@/hooks/useBatchSync';
import { Batch, BatchFormData, TextPrompt } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

export const useBatchOperations = () => {
  const { batches, setBatches } = usePersistentBatches();
  const { triggerBatchSync } = useBatchSync();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { status: batchStatus, loading: automationLoading, error: automationError, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

  const createBatch = (formData: BatchFormData) => {
    // Auto-detect platform from target URL
    const detectedPlatform = detectPlatformFromUrl(formData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const batch: Batch = {
      id: crypto.randomUUID(),
      name: formData.name,
      targetUrl: formData.targetUrl,
      description: formData.description,
      prompts: [{
        id: crypto.randomUUID(),
        text: formData.initialPrompt,
        order: 0
      }],
      status: 'pending',
      createdAt: new Date(),
      platform: detectedPlatform,
      settings: {
        waitForIdle: formData.waitForIdle,
        maxRetries: formData.maxRetries
      }
    };

    setBatches(prev => [...prev, batch]);
    
    // Trigger sync to update all components
    setTimeout(() => {
      triggerBatchSync();
    }, 100);
    
    toast({
      title: "Batch created",
      description: `Batch "${batch.name}" created with auto-detected platform: ${platformName}. Wait for idle: ${formData.waitForIdle ? 'enabled' : 'disabled'}.`,
    });
  };

  const deleteBatch = (batchId: string) => {
    console.log('Deleting batch:', batchId);
    
    setBatches(prev => {
      const updatedBatches = prev.filter(b => b.id !== batchId);
      console.log('Updated batches after deletion:', updatedBatches);
      return updatedBatches;
    });
    
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
    
    // Trigger sync to update all components immediately
    setTimeout(() => {
      triggerBatchSync();
    }, 100);
    
    toast({
      title: "Batch deleted",
      description: "Batch has been removed from the queue.",
    });
  };

  const handleRunBatch = async (batch: Batch) => {
    // Auto-detect platform if not set or if URL changed
    const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!detectedPlatform) {
      toast({
        title: "Cannot detect platform",
        description: "Unable to determine automation platform from the target URL. Please check the URL format.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBatchId(batch.id);
    
    try {
      // Pass the complete batch object with updated settings
      const batchWithPlatform = {
        ...batch,
        platform: detectedPlatform,
        settings: {
          waitForIdle: batch.settings?.waitForIdle ?? true,
          maxRetries: batch.settings?.maxRetries ?? 0
        }
      };
      
      await runBatch(batchWithPlatform, detectedPlatform, batchWithPlatform.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running', platform: detectedPlatform } : b
      ));
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}" using ${platformName} with idle detection.`,
      });
    } catch (err) {
      toast({
        title: "Failed to start batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleStopBatch = async (batch: Batch) => {
    try {
      await stopBatch();
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' } : b
      ));
      
      toast({
        title: "Batch stopped",
        description: `Automation stopped for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to stop batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const updatePrompt = (batchId: string, promptId: string, text: string) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.map(prompt => 
            prompt.id === promptId ? { ...prompt, text } : prompt
          )
        };
      }
      return batch;
    }));
  };

  const deletePrompt = (batchId: string, promptId: string) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.filter(p => p.id !== promptId)
        };
      }
      return batch;
    }));
  };

  const addPromptToBatch = (batchId: string) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        const newPrompt: TextPrompt = {
          id: crypto.randomUUID(),
          text: '',
          order: batch.prompts.length
        };
        return {
          ...batch,
          prompts: [...batch.prompts, newPrompt]
        };
      }
      return batch;
    }));
  };

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
    addPromptToBatch
  };
};
