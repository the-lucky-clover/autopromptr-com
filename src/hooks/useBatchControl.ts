import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { EnhancedAutoPromptrClient } from '@/services/autoPromptr/enhancedClient';
import { AutoPromptrError } from '@/services/autoPromptr/errors';

type UseBatchControlParams = {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
};

export const useBatchControl = ({ batches, setBatches }: UseBatchControlParams) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [lastError, setLastError] = useState<AutoPromptrError | null>(null);
  const { toast } = useToast();

  const validateBatchForExecution = useCallback((batch: Batch): { isValid: boolean; error?: string } => {
    if (!batch.targetUrl || !batch.targetUrl.trim()) {
      return {
        isValid: false,
        error: 'Target Project URL is required. Please edit the batch and add a valid URL or local path.',
      };
    }

    const targetUrl = batch.targetUrl.trim();
    const isUrl = /^https?:\/\//.test(targetUrl);
    const isLocalPath =
      /^[A-Za-z]:\\/.test(targetUrl) ||
      /^\//.test(targetUrl) ||
      /^~\//.test(targetUrl) ||
      /^\.\//.test(targetUrl);

    if (!isUrl && !isLocalPath) {
      return {
        isValid: false,
        error: 'Invalid target format. Please provide a valid URL (https://...) or local path (/path/to/project).',
      };
    }

    if (!batch.prompts || batch.prompts.length === 0) {
      return { isValid: false, error: 'No prompts found. Please add at least one prompt to the batch.' };
    }

    const validPrompts = batch.prompts.filter((p) => p.text && p.text.trim());
    if (validPrompts.length === 0) {
      return { isValid: false, error: 'No valid prompts found. Please ensure at least one prompt has content.' };
    }

    return { isValid: true };
  }, []);

  const detectPlatformFromUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    if (/^https?:\/\//.test(url)) return 'web';
    return 'cursor'; // default local platform
  }, []);

  const getApiKey = useCallback((keyName: string): string | null => {
    return localStorage.getItem(keyName);
  }, []);

  // Placeholder: Replace with your actual LangChain batch runner
  const runBatchWithLangChain = useCallback(
    async (batch: Batch, apiKey: string) => {
      // Example: call your LangChain API here
      // throw new Error('LangChain not implemented'); // uncomment to simulate failure
      return Promise.resolve();
    },
    []
  );

  const runBatchWithEnhancedClient = useCallback(
    async (batch: Batch, platform: string) => {
      const client = new EnhancedAutoPromptrClient();

      // Test backend connection
      await client.testConnection();

      // Run batch with provided settings
      await client.runBatch(batch, platform, batch.settings);
    },
    []
  );

  const handleRunBatch = useCallback(
    async (batch: Batch) => {
      // Validate batch
      const validation = validateBatchForExecution(batch);
      if (!validation.isValid) {
        toast({ title: 'Cannot start batch', description: validation.error, variant: 'destructive' });
        return;
      }

      if (batches.find((b) => b.status === 'running')) {
        toast({
          title: 'Batch already running',
          description: 'Only one batch can run at a time. Please wait for the current batch to finish.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedBatchId(batch.id);
      setAutomationLoading(true);
      setLastError(null);

      try {
        const platform = detectPlatformFromUrl(batch.targetUrl) || 'web';
        const apiKey = getApiKey('openai_api_key');

        if (apiKey) {
          try {
            await runBatchWithLangChain(batch, apiKey);
            setBatches((prev) =>
              prev.map((b) => (b.id === batch.id ? { ...b, status: 'running', platform } : b))
            );
            toast({
              title: 'Batch started',
              description: `LangChain automation started for "${batch.name}".`,
              variant: 'success',
            });
            return;
          } catch (langErr) {
            console.warn('LangChain failed, falling back to enhanced client:', langErr);
          }
        }

        // Fallback to enhanced client
        await runBatchWithEnhancedClient(batch, platform);
        setBatches((prev) =>
          prev.map((b) => (b.id === batch.id ? { ...b, status: 'running', platform } : b))
        );
        toast({
          title: 'Batch started',
          description: `Enhanced automation started for "${batch.name}".`,
          variant: 'success',
        });
      } catch (err) {
        console.error('Batch run failed:', err);
        setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: 'failed' } : b)));

        const errorInstance =
          err instanceof AutoPromptrError ? err : AutoPromptrError.fromBackendError(err);
        setLastError(errorInstance);

        toast({
          title: 'Batch execution failed',
          description: errorInstance.userMessage || 'Unknown error occurred',
          variant: 'destructive',
        });
      } finally {
        setAutomationLoading(false);
      }
    },
    [
      batches,
      setBatches,
      validateBatchForExecution,
      detectPlatformFromUrl,
      getApiKey,
      runBatchWithLangChain,
      runBatchWithEnhancedClient,
      toast,
    ]
  );

  // Implement other handlers similarly (stop, pause, rewind)...

  const handleStopBatch = useCallback(
    async (batch: Batch) => {
      try {
        const client = new EnhancedAutoPromptrClient();
        await client.stopBatch(batch.id);
        setBatches((prev) =>
          prev.map((b) => (b.id === batch.id ? { ...b, status: 'failed' } : b))
        );
        toast({
          title: 'Batch stopped',
          description: `Automation stopped for "${batch.name}".`,
          variant: 'success',
        });
      } catch (err) {
        toast({
          title: 'Failed to stop batch',
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        });
      }
    },
    [setBatches, toast]
  );

  const handlePauseBatch = useCallback(
    (batch: Batch) => {
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: 'paused' } : b))
      );
      toast({
        title: 'Batch paused',
        description: `Batch "${batch.name}" has been paused.`,
        variant: 'success',
      });
    },
    [setBatches, toast]
  );

  const handleRewindBatch = useCallback(
    (batch: Batch) => {
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: 'pending' } : b))
      );
      toast({
        title: 'Batch rewound',
        description: `Batch "${batch.name}" has been reset to pending.`,
        variant: 'success',
      });
    },
    [setBatches, toast]
  );

  return {
    selectedBatchId,
    automationLoading,
    lastError,
    clearError: () => setLastError(null),
    validateBatchForExecution,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch,
  };
};
