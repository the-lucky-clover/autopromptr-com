import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { useLangChainBatchRunner } from '@/hooks/useLangChainBatchRunner';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { Batch, BatchFormData, TextPrompt } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { InputValidationService } from '@/services/security/inputValidation';

export const useBatchOperations = () => {
  const { batches, setBatches, triggerManualSync } = usePersistentBatches();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { status: batchStatus, loading: automationLoading, error: automationError, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);
  const { handleRunBatchWithLangChain } = useLangChainBatchRunner();
  const { getApiKey, hasApiKey } = useSecureApiKeys();

  const createBatch = (formData: BatchFormData) => {
    // Input validation
    const nameValidation = InputValidationService.validateBatchName(formData.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Invalid batch name",
        description: nameValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (!InputValidationService.validateUrl(formData.targetUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP or HTTPS URL.",
        variant: "destructive",
      });
      return;
    }

    const promptValidation = InputValidationService.validatePromptText(formData.initialPrompt);
    if (!promptValidation.isValid) {
      toast({
        title: "Invalid prompt",
        description: promptValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Auto-detect platform from target URL
    const detectedPlatform = detectPlatformFromUrl(formData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const batch: Batch = {
      id: crypto.randomUUID(),
      name: InputValidationService.sanitizeInput(formData.name),
      targetUrl: formData.targetUrl,
      description: formData.description ? InputValidationService.sanitizeInput(formData.description) : undefined,
      prompts: [{
        id: crypto.randomUUID(),
        text: InputValidationService.sanitizeInput(formData.initialPrompt),
        order: 0
      }],
      status: 'pending',
      createdAt: new Date(),
      platform: detectedPlatform,
      settings: {
        waitForIdle: formData.waitForIdle,
        maxRetries: Math.min(formData.maxRetries || 0, 5) // Security: Limit max retries
      }
    };

    setBatches(prev => [...prev, batch]);
    
    // Manually trigger sync only for this explicit user action
    triggerManualSync();
    
    toast({
      title: "Batch created securely",
      description: `Batch "${batch.name}" created with auto-detected platform: ${platformName}. Input has been validated and sanitized.`,
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
    
    // Manually trigger sync only for this explicit user action
    triggerManualSync();
    
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
      // Primary method: LangChain processing with secure API key
      console.log('🔗 Using LangChain as primary batch processor');
      
      // Get API key from secure storage
      const apiKey = getApiKey('openai_api_key');
      
      if (!apiKey || !hasApiKey('openai_api_key')) {
        toast({
          title: "API Key Required",
          description: "OpenAI API key required for LangChain processing. Please configure it in the secure API key manager.",
          variant: "destructive",
        });
        return;
      }
      
      await handleRunBatchWithLangChain(batch, setBatches, apiKey);
      
    } catch (err) {
      console.error('LangChain processing failed, falling back to legacy methods:', err);
      
      // Fallback to existing automation methods (Playwright/Puppeteer)
      try {
        // Pass the complete batch object with updated settings
        const batchWithPlatform = {
          ...batch,
          platform: detectedPlatform,
          settings: {
            waitForIdle: batch.settings?.waitForIdle ?? true,
            maxRetries: Math.min(batch.settings?.maxRetries ?? 0, 3) // Security: Limit retries
          }
        };
        
        await runBatch(batchWithPlatform, detectedPlatform, batchWithPlatform.settings);
        
        setBatches(prev => prev.map(b => 
          b.id === batch.id ? { ...b, status: 'running', platform: detectedPlatform } : b
        ));
        
        toast({
          title: "Fallback batch started",
          description: `LangChain failed, using fallback automation for "${batch.name}" with ${platformName}.`,
        });
      } catch (fallbackErr) {
        let errorTitle = "All batch processing methods failed";
        let errorDescription = fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error';
        
        // Enhanced error handling for specific backend configuration issues
        if (fallbackErr instanceof Error && fallbackErr.message.includes('AUTOMATION_ENDPOINTS_NOT_CONFIGURED')) {
          errorTitle = "Backend not configured for automation";
          errorDescription = "Both LangChain and backend automation services failed. Please check configuration.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
      }
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
    // Input validation
    const validation = InputValidationService.validatePromptText(text);
    if (!validation.isValid) {
      toast({
        title: "Invalid prompt text",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const sanitizedText = InputValidationService.sanitizeInput(text);

    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.map(prompt => 
            prompt.id === promptId ? { ...prompt, text: sanitizedText } : prompt
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
