import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from './useSecureAuth';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { InputValidationService } from '@/services/security/inputValidation';
import { SecureAutoPromptr } from '@/services/autoPromptr/secureClient';
import { Batch, BatchFormData, TextPrompt } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

const MAX_RETRIES = 3; // Unified max retries limit

export const useSecureBatchOperations = () => {
  const { batches, setBatches } = usePersistentBatches();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { requireAuth, hasPermission } = useSecureAuth();
  const [automationLoading, setAutomationLoading] = useState(false);

  const handleError = (err: unknown) => {
    let title = "Operation failed";
    let description = err instanceof Error ? err.message : 'Unknown error';

    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes('invalid_')) {
        title = "Input validation failed";
        description = "Invalid input detected. Please check your batch configuration.";
      } else if (msg.includes('rate limit')) {
        title = "Rate limit exceeded";
        description = "Too many requests. Please wait before trying again.";
      } else if (msg.includes('automation_endpoints_not_configured')) {
        title = "Backend not configured for automation";
        description = "The backend service needs to be configured with automation endpoints.";
      }
    }

    toast({ title, description, variant: 'destructive' });
    return description;
  };

  const createBatch = (formData: BatchFormData): boolean => {
    if (!requireAuth()) {
      toast({ title: "Authentication required", description: "Please log in to create batches.", variant: "destructive" });
      return false;
    }

    const nameValidation = InputValidationService.validateBatchName(formData.name);
    if (!nameValidation.isValid) {
      toast({ title: "Invalid batch name", description: nameValidation.error, variant: "destructive" });
      return false;
    }

    if (!InputValidationService.validateUrl(formData.targetUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid HTTP or HTTPS URL.", variant: "destructive" });
      return false;
    }

    const promptValidation = InputValidationService.validatePromptText(formData.initialPrompt);
    if (!promptValidation.isValid) {
      toast({ title: "Invalid prompt", description: promptValidation.error, variant: "destructive" });
      return false;
    }

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
        order: 0,
      }],
      status: 'pending',
      createdAt: new Date(),
      platform: detectedPlatform,
      settings: {
        waitForIdle: formData.waitForIdle,
        maxRetries: Math.min(formData.maxRetries || MAX_RETRIES, MAX_RETRIES), // Clamp to unified max retries
      }
    };

    setBatches(prev => [...prev, batch]);

    toast({
      title: "Batch created securely",
      description: `Batch "${batch.name}" created with platform: ${platformName}. Input sanitized for security.`,
      variant: "success",
    });

    return true;
  };

  const deleteBatch = (batchId: string): boolean => {
    if (!requireAuth()) {
      toast({ title: "Authentication required", description: "Please log in to delete batches.", variant: "destructive" });
      return false;
    }

    setBatches(prev => prev.filter(b => b.id !== batchId));

    if (selectedBatchId === batchId) setSelectedBatchId(null);

    toast({ title: "Batch deleted securely", description: "Batch has been securely removed.", variant: "success" });

    return true;
  };

  const handleRunBatch = async (batch: Batch) => {
    if (!requireAuth()) {
      toast({ title: "Authentication required", description: "Please log in to run batches.", variant: "destructive" });
      return;
    }

    const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!detectedPlatform) {
      toast({ title: "Cannot detect platform", description: "Unable to determine platform from target URL.", variant: "destructive" });
      return;
    }

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);

    // Set batch status to 'pending' before running
    setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'pending', errorMessage: undefined } : b));

    try {
      const secureAutoPromptr = new SecureAutoPromptr();

      const batchWithPlatform = {
        ...batch,
        platform: detectedPlatform,
        settings: {
          waitForIdle: batch.settings?.waitForIdle ?? true,
          maxRetries: Math.min(batch.settings?.maxRetries ?? MAX_RETRIES, MAX_RETRIES)
        }
      };

      await secureAutoPromptr.runBatch(batchWithPlatform, detectedPlatform, batchWithPlatform.settings);

      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'running', platform: detectedPlatform, errorMessage: undefined } : b));

      toast({
        title: "Secure batch started",
        description: `Secure automation started for "${batch.name}" using ${platformName} with input validation.`,
        variant: "success",
      });
    } catch (err) {
      const errorMessage = handleError(err);

      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: 'failed', errorMessage } : b));
    } finally {
      setAutomationLoading(false);
    }
  };

  const updatePrompt = (batchId: string, promptId: string, text: string) => {
    if (!requireAuth()) {
      toast({ title: "Authentication required", description: "Please log in to update prompts.", variant: "destructive" });
      return;
    }

    const validation = InputValidationService.validatePromptText(text);
    if (!validation.isValid) {
      toast({ title: "Invalid prompt text", description: validation.error, variant: "destructive" });
      return;
    }

    const sanitizedText = InputValidationService.sanitizeInput(text);

    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.map(prompt =>
            prompt.id === promptId ? { ...prompt, text: sanitizedText } : prompt
          ),
        };
      }
      return batch;
    }));
  };

  const addPromptToBatch = (batchId: string) => {
    if (!requireAuth()) {
      toast({ title: "Authentication required", description: "Please log in to add prompts.", variant: "destructive" });
      return;
    }

    setBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        const newPrompt: TextPrompt = {
          id: crypto.randomUUID(),
          text: '',
          order: batch.prompts.length,
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
    hasPermission,
    requireAuth,
  };
};
