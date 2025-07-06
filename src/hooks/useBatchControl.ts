import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { EnhancedAutoPromptrClient } from '@/services/autoPromptr/enhancedClient';
import { AutoPromptrError } from '@/services/autoPromptr/errors';

export const useBatchControl = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [lastError, setLastError] = useState<AutoPromptrError | null>(null);
  const { toast } = useToast();

  const validateBatchForExecution = (batch: Batch): { isValid: boolean; error?: string } => {
    const url = batch.targetUrl?.trim();
    const isUrl = /^https?:\/\//.test(url || '');
    const isLocalPath = /^[A-Za-z]:\\/.test(url || '') || /^(\.\/|\/|~\/)/.test(url || '');

    if (!url) return { isValid: false, error: 'Target Project URL is required. Please add a valid URL or path.' };
    if (!isUrl && !isLocalPath) return { isValid: false, error: 'Invalid target format. Must be a valid URL or local path.' };

    const validPrompts = (batch.prompts || []).filter(p => p.text?.trim());
    if (!validPrompts.length) return { isValid: false, error: 'Please provide at least one valid prompt.' };

    return { isValid: true };
  };

  const handleRunBatch = async (
    batch: Batch,
    setBatches: (fn: (prev: Batch[]) => Batch[]) => void,
    onStatusChange?: (status: 'running' | 'failed') => void
  ) => {
    const validation = validateBatchForExecution(batch);
    if (!validation.isValid) {
      toast({ title: 'Cannot start batch', description: validation.error, variant: 'destructive' });
      return;
    }

    const overrideUrl = localStorage.getItem('targetUrlOverride')?.trim();
    const targetUrl = overrideUrl || batch.targetUrl?.trim();
    const isLocal = !/^https?:\/\//.test(targetUrl || '');
    const platform = isLocal ? batch.settings?.localAIAssistant || 'cursor' : 'web';

    if (!targetUrl) {
      toast({ title: 'Missing Target URL', description: 'Batch targetUrl is undefined after override logic.', variant: 'destructive' });
      return;
    }

    let hasRunning = false;
    setBatches(prev => {
      hasRunning = prev.some(b => b.status === 'running');
      return prev;
    });

    if (hasRunning) {
      toast({
        title: 'Another batch is running',
        description: 'Please wait for the current batch to complete.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    setLastError(null);

    const enhancedClient = new EnhancedAutoPromptrClient();

    const enhancedBatch: Batch = {
      ...batch,
      targetUrl,
      platform,
      settings: {
        ...batch.settings,
        isLocalPath: isLocal,
        promptEnhancement: localStorage.getItem('promptEnhancement') === 'true',
        targetUrlOverride: overrideUrl || undefined,
        chromeArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    };

    try {
      await enhancedClient.testConnection();
      console.log('✅ Verified backend connection');

      console.log('📦 Submitting batch:', {
        batchId: enhancedBatch.id,
        targetUrl: enhancedBatch.targetUrl,
        platform: enhancedBatch.platform,
        promptCount: enhancedBatch.prompts?.length,
        settings: enhancedBatch.settings,
      });

      await enhancedClient.runBatch(enhancedBatch, platform, enhancedBatch.settings);

      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'running', platform } : b));
      onStatusChange?.('running');

      toast({
        title: 'Batch started',
        description: `"${batch.name}" is now running.${overrideUrl ? ` (override used)` : ''}`,
        variant: 'default'
      });
    } catch (err) {
      console.error('💥 Batch execution failed:', err);

      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'failed' } : b));
      onStatusChange?.('failed');

      const normalized = err instanceof AutoPromptrError
        ? err
        : AutoPromptrError.fromBackendError(err);

      setLastError(normalized);

      toast({
        title: normalized.code === 'BACKEND_ERROR' ? 'Backend Error' : 'Batch failed',
        description: normalized.userMessage || (err instanceof Error ? err.message : 'An unexpected error occurred.'),
        variant: 'destructive'
      });
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleStopBatch = async (
    batch: Batch,
    setBatches: (fn: (prev: Batch[]) => Batch[]) => void
  ) => {
    try {
      const client = new EnhancedAutoPromptrClient();
      await client.stopBatch(batch.id);
      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'failed' } : b));
      toast({ title: 'Batch stopped', description: `"${batch.name}" has been stopped.` });
    } catch (err) {
      toast({ title: 'Error stopping batch', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handlePauseBatch = (
    batch: Batch,
    setBatches: (fn: (prev: Batch[]) => Batch[]) => void
  ) => {
    setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'paused' } : b));
    toast({ title: 'Batch paused', description: `"${batch.name}" has been paused.` });
  };

  const handleRewindBatch = (
    batch: Batch,
    setBatches: (fn: (prev: Batch[]) => Batch[]) => void
  ) => {
    setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'pending' } : b));
    toast({ title: 'Batch reset', description: `"${batch.name}" has been rewound to pending.` });
  };

  return {
    selectedBatchId,
    automationLoading,
    lastError,
    clearError: () => setLastError(null),
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch,
    validateBatchForExecution,
  };
};
