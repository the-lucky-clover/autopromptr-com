
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { Batch } from '@/types/batch';

export const useBatchControl = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { loading: automationLoading, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

  const validateBatchForExecution = (batch: Batch): { isValid: boolean; error?: string } => {
    // Check if target URL is provided
    if (!batch.targetUrl || !batch.targetUrl.trim()) {
      return {
        isValid: false,
        error: 'Target Project URL is required. Please edit the batch and add a valid URL or local path.'
      };
    }

    // Check if URL/path format is valid
    const targetUrl = batch.targetUrl.trim();
    const isUrl = targetUrl.match(/^https?:\/\//);
    const isLocalPath = targetUrl.match(/^[A-Za-z]:\\/) || targetUrl.match(/^\//) || targetUrl.match(/^~\//) || targetUrl.match(/^\.\//);
    
    if (!isUrl && !isLocalPath) {
      return {
        isValid: false,
        error: 'Invalid target format. Please provide a valid URL (https://...) or local path (/path/to/project).'
      };
    }

    // Check if prompts are provided
    if (!batch.prompts || batch.prompts.length === 0) {
      return {
        isValid: false,
        error: 'No prompts found. Please add at least one prompt to the batch.'
      };
    }

    // Check if prompts have content
    const validPrompts = batch.prompts.filter(p => p.text && p.text.trim());
    if (validPrompts.length === 0) {
      return {
        isValid: false,
        error: 'No valid prompts found. Please ensure at least one prompt has content.'
      };
    }

    return { isValid: true };
  };

  const handleRunBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    // Validate batch before execution
    const validation = validateBatchForExecution(batch);
    if (!validation.isValid) {
      toast({
        title: "Cannot start batch",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Get target URL override from localStorage if available
    const targetUrlOverride = localStorage.getItem('targetUrlOverride');
    const effectiveTargetUrl = targetUrlOverride && targetUrlOverride.trim() 
      ? targetUrlOverride.trim() 
      : batch.targetUrl;

    // Detect platform from the effective target URL
    const isLocalPath = !effectiveTargetUrl.match(/^https?:\/\//);
    const platform = isLocalPath ? batch.settings?.localAIAssistant || 'cursor' : 'web';

    // Check if any batch is already running
    const runningBatch = await new Promise<Batch | null>((resolve) => {
      setBatches(prev => {
        const running = prev.find(b => b.status === 'running');
        resolve(running || null);
        return prev;
      });
    });

    if (runningBatch) {
      toast({
        title: "Batch already running",
        description: `Cannot start "${batch.name}" because "${runningBatch.name}" is already processing. Only one batch can run at a time.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedBatchId(batch.id);
    
    try {
      // Create enhanced batch with overrides and settings
      const enhancedBatch = {
        ...batch,
        targetUrl: effectiveTargetUrl,
        platform,
        settings: {
          ...batch.settings,
          isLocalPath,
          promptEnhancement: localStorage.getItem('promptEnhancement') === 'true',
          targetUrlOverride: targetUrlOverride || undefined,
        }
      };
      
      // Pass the complete batch object to the automation service
      await runBatch(enhancedBatch, platform, enhancedBatch.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running', platform } : b
      ));
      
      const overrideMessage = targetUrlOverride ? ` (using override: ${targetUrlOverride})` : '';
      toast({
        title: "Batch started successfully",
        description: `Automation started for "${batch.name}"${overrideMessage}.`,
      });
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Enhanced error handling
      if (errorMessage.includes('INVALID_URL')) {
        errorMessage = 'Invalid target URL. Please check the URL format and try again.';
      } else if (errorMessage.includes('LOCAL_PATH_NOT_FOUND')) {
        errorMessage = 'Local path not found. Please verify the path exists and is accessible.';
      } else if (errorMessage.includes('AI_ASSISTANT_NOT_CONFIGURED')) {
        errorMessage = 'Local AI assistant not properly configured. Please check your settings.';
      }
      
      toast({
        title: "Failed to start batch",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleStopBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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

  const handlePauseBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    // Implement pause functionality if needed
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'paused' } : b
    ));
    
    toast({
      title: "Batch paused",
      description: `Batch "${batch.name}" has been paused.`,
    });
  };

  const handleRewindBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    // Implement rewind functionality if needed
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'pending' } : b
    ));
    
    toast({
      title: "Batch rewound",
      description: `Batch "${batch.name}" has been reset to pending.`,
    });
  };

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch,
    validateBatchForExecution
  };
};
