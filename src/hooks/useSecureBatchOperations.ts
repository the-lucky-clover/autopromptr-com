
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from './useSecureAuth';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { InputValidationService } from '@/services/security/inputValidation';
import { SecureAutoPromptr } from '@/services/autoPromptr/secureClient';
import { Batch, BatchFormData, TextPrompt } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

export const useSecureBatchOperations = () => {
  const { batches, setBatches, triggerManualSync } = usePersistentBatches();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { requireAuth, hasPermission } = useSecureAuth();
  const [automationLoading, setAutomationLoading] = useState(false);

  const createBatch = (formData: BatchFormData) => {
    // Security check
    if (!requireAuth()) {
      toast({
        title: "Authentication required",
        description: "Please log in to create batches.",
        variant: "destructive",
      });
      return;
    }

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
    triggerManualSync();
    
    toast({
      title: "Batch created securely",
      description: `Batch "${batch.name}" created with platform: ${platformName}. Input has been sanitized for security.`,
    });
  };

  const deleteBatch = (batchId: string) => {
    // Security check
    if (!requireAuth()) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete batches.",
        variant: "destructive",
      });
      return;
    }

    console.log('Securely deleting batch:', batchId);
    
    setBatches(prev => {
      const updatedBatches = prev.filter(b => b.id !== batchId);
      console.log('Updated batches after secure deletion:', updatedBatches);
      return updatedBatches;
    });
    
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
    
    triggerManualSync();
    
    toast({
      title: "Batch deleted securely",
      description: "Batch has been securely removed from the queue.",
    });
  };

  const handleRunBatch = async (batch: Batch) => {
    // Security checks
    if (!requireAuth()) {
      toast({
        title: "Authentication required",
        description: "Please log in to run batches.",
        variant: "destructive",
      });
      return;
    }

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
    setAutomationLoading(true);
    
    try {
      // Use secure AutoPromptr client
      const secureAutoPromptr = new SecureAutoPromptr();
      
      // Pass the complete batch object with updated settings
      const batchWithPlatform = {
        ...batch,
        platform: detectedPlatform,
        settings: {
          waitForIdle: batch.settings?.waitForIdle ?? true,
          maxRetries: Math.min(batch.settings?.maxRetries ?? 0, 3) // Security: Limit retries
        }
      };
      
      await secureAutoPromptr.runBatch(batchWithPlatform, detectedPlatform, batchWithPlatform.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running', platform: detectedPlatform } : b
      ));
      
      toast({
        title: "Secure batch started",
        description: `Secure automation started for "${batch.name}" using ${platformName} with input validation.`,
      });
    } catch (err) {
      let errorTitle = "Failed to start secure batch";
      let errorDescription = err instanceof Error ? err.message : 'Unknown error';
      
      // Enhanced error handling for security
      if (err instanceof Error && err.message.includes('INVALID_')) {
        errorTitle = "Input validation failed";
        errorDescription = "Invalid input detected. Please check your batch configuration.";
      } else if (err instanceof Error && err.message.includes('Rate limit')) {
        errorTitle = "Rate limit exceeded";
        errorDescription = "Too many requests. Please wait before trying again.";
      } else if (err instanceof Error && err.message.includes('AUTOMATION_ENDPOINTS_NOT_CONFIGURED')) {
        errorTitle = "Backend not configured for automation";
        errorDescription = "The backend service needs to be configured with automation endpoints.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setAutomationLoading(false);
    }
  };

  const updatePrompt = (batchId: string, promptId: string, text: string) => {
    // Security check
    if (!requireAuth()) {
      toast({
        title: "Authentication required",
        description: "Please log in to update prompts.",
        variant: "destructive",
      });
      return;
    }

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

  const addPromptToBatch = (batchId: string) => {
    // Security check
    if (!requireAuth()) {
      toast({
        title: "Authentication required",
        description: "Please log in to add prompts.",
        variant: "destructive",
      });
      return;
    }

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
    automationLoading,
    createBatch,
    deleteBatch,
    handleRunBatch,
    updatePrompt,
    addPromptToBatch,
    // Security utilities
    hasPermission,
    requireAuth
  };
};
