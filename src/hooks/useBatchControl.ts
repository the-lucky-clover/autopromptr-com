import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { EnhancedAutoPromptprClient } from '@/services/autoPromptr/enhancedClient';
import { AutoPromptprError } from '@/services/autoPromptr/errors';

export const useBatchControl = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [lastError, setLastError] = useState<AutoPromptprError | null>(null);
  const { toast } = useToast();

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
    setAutomationLoading(true);
    setLastError(null);
    
    try {
      // Use enhanced client with better error handling
      const enhancedClient = new EnhancedAutoPromptprClient();
      
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
          // Enhanced Chrome configuration
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
      
      // Test connection first
      await enhancedClient.testConnection();
      console.log('✅ Backend connection verified');
      
      // Run batch with enhanced client
      await enhancedClient.runBatch(enhancedBatch, platform, enhancedBatch.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running', platform } : b
      ));
      
      const overrideMessage = targetUrlOverride ? ` (using override: ${targetUrlOverride})` : '';
      toast({
        title: "Batch started successfully",
        description: `Enhanced automation started for "${batch.name}"${overrideMessage}.`,
      });
      
    } catch (err) {
      console.error('💥 Enhanced batch run failed:', err);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' } : b
      ));
      
      if (err instanceof AutoPromptprError) {
        setLastError(err);
        
        // Show user-friendly error message
        toast({
          title: "Batch execution failed",
          description: err.userMessage,
          variant: "destructive",
        });
      } else {
        const genericError = AutoPromptprError.fromBackendError(err);
        setLastError(genericError);
        
        toast({
          title: "Unexpected error",
          description: genericError.userMessage,
          variant: "destructive",
        });
      }
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleStopBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    try {
      const enhancedClient = new EnhancedAutoPromptprClient();
      await enhancedClient.stopBatch(batch.id);
      
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
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'paused' } : b
    ));
    
    toast({
      title: "Batch paused",
      description: `Batch "${batch.name}" has been paused.`,
    });
  };

  const handleRewindBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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
    lastError,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch,
    validateBatchForExecution,
    clearError: () => setLastError(null)
  };
};
