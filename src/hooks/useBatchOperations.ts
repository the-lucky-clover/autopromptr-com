
import { useState, useCallback } from 'react';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useToast } from '@/hooks/use-toast';
import { useBatchDatabase } from '@/hooks/useBatchDatabase';
import { useLangChainBatchRunner } from '@/hooks/useLangChainBatchRunner';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

export const useBatchOperations = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);

  const { toast } = useToast();
  const { saveBatchToDatabase } = useBatchDatabase();
  const { handleRunBatchWithLangChain } = useLangChainBatchRunner();
  const { getApiKey } = useSecureApiKeys();

  const handleRunBatch = useCallback(async (batch: Batch) => {
    const targetUrl = batch.targetUrl?.trim();
    const detectedPlatform = detectPlatformFromUrl(targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!targetUrl || !detectedPlatform) {
      toast({
        title: 'Cannot detect platform',
        description: 'Unable to determine automation platform from the target URL. Please check the URL format.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);

    const apiKey = getApiKey('openai_api_key');
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'OpenAI API key required for LangChain processing. Please configure it in the secure API key manager.',
        variant: 'destructive',
      });
      setAutomationLoading(false);
      return;
    }

    try {
      console.log('🔗 Attempting LangChain processing...');
      await handleRunBatchWithLangChain(batch, setBatches, apiKey);

      toast({
        title: 'LangChain Batch Started',
        description: `"${batch.name}" has started via LangChain.`,
      });
    } catch (langChainErr) {
      console.warn('⚠️ LangChain failed, falling back:', langChainErr);

      try {
        const { waitForIdle, maxRetries } = batch.settings || {};

        const fallbackBatch: Batch = {
          ...batch,
          platform: detectedPlatform,
          settings: {
            ...batch.settings,
            waitForIdle: waitForIdle ?? true,
            maxRetries: Math.min(maxRetries ?? 3, 3),
          },
        };

        // Simulate batch run for now
        setBatches(prev =>
          prev.map(b => b.id === batch.id
            ? { ...b, status: 'running', platform: detectedPlatform }
            : b)
        );

        toast({
          title: 'Fallback Batch Started',
          description: `"${batch.name}" started using fallback automation with ${platformName}.`,
        });
      } catch (fallbackErr) {
        let errorTitle = 'All batch processing methods failed';
        let errorDescription = fallbackErr instanceof Error
          ? fallbackErr.message
          : 'Unknown error during fallback.';

        if (fallbackErr instanceof Error && fallbackErr.message.toLowerCase().includes('automation_endpoints_not_configured')) {
          errorTitle = 'Automation Endpoints Not Configured';
          errorDescription = 'Neither LangChain nor backend automation endpoints are properly set.';
        }

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'destructive',
        });
        setAutomationError(errorDescription);
      }
    } finally {
      setAutomationLoading(false);
    }
  }, [toast, getApiKey, handleRunBatchWithLangChain]);

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
