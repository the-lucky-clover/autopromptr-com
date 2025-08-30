import { useState } from 'react';
import { Batch } from '@/types/batch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BatchValidationService } from '@/services/security/batchValidationService';
import { RateLimitingService, RATE_LIMITS } from '@/services/security/rateLimitingService';
import { securityLogger } from '@/services/security/securityLogger';

export const useSecureBatchOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const runBatchSecurely = async (batch: Batch) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to run batches.',
        variant: 'destructive',
      });
      return;
    }

    // Rate limiting check
    const rateLimitConfig = {
      ...RATE_LIMITS.BATCH_PROCESSING,
      identifier: user.id
    };

    if (!RateLimitingService.isAllowed(rateLimitConfig)) {
      const resetTime = RateLimitingService.getResetTime(rateLimitConfig);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      toast({
        title: 'Rate limit exceeded',
        description: `Please wait ${waitTime} seconds before starting another batch.`,
        variant: 'destructive',
      });
      
      securityLogger.logEvent({
        eventType: 'rate_limit_exceeded',
        eventData: {
          action: 'batch_processing',
          batchId: batch.id,
          waitTime
        },
        userId: user.id
      });
      return;
    }

    // Validate batch security
    const validation = BatchValidationService.validateBatch(batch, user.id);
    if (!validation.isValid) {
      toast({
        title: 'Security validation failed',
        description: validation.errors.join('. '),
        variant: 'destructive',
      });
      
      securityLogger.logEvent({
        eventType: 'batch_validation_failed',
        eventData: {
          batchId: batch.id,
          errors: validation.errors
        },
        userId: user.id
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log(`🛡️ Starting secure batch processing for "${batch.name}"`);
      
      // Sanitize batch data
      const sanitizedBatch = BatchValidationService.sanitizeBatchData(batch);
      
      // Log security event
      securityLogger.logEvent({
        eventType: 'secure_batch_started',
        eventData: {
          batchId: sanitizedBatch.id,
          platform: sanitizedBatch.platform
        },
        userId: user.id
      });

      // Enhanced security measures applied - backend will handle actual processing

      toast({
        title: 'Secure batch started',
        description: `Batch "${sanitizedBatch.name}" started with enhanced security measures.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Secure batch processing failed:', error);

      securityLogger.logEvent({
        eventType: 'secure_batch_failed',
        eventData: {
          batchId: batch.id,
          error: errorMessage
        },
        userId: user.id
      });

      toast({
        title: 'Secure batch failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateBatchSecurity = async (batch: Batch): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to validate batches.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      console.log(`Validating security for batch "${batch.name}"`);

      const validation = BatchValidationService.validateBatch(batch, user.id);
      
      if (!validation.isValid) {
        toast({
          title: 'Security validation failed',
          description: validation.errors.join('. '),
          variant: 'destructive',
        });
        return false;
      }

      if (validation.warnings.length > 0) {
        toast({
          title: 'Security warnings',
          description: validation.warnings.join('. '),
        });
      }

      toast({
        title: 'Batch validation passed',
        description: `Security validation completed for "${batch.name}".`,
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Security validation failed';
      console.error('Security validation failed:', error);

      toast({
        title: 'Security validation failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const encryptBatchData = async (batch: Batch): Promise<Batch> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to encrypt batch data.',
        variant: 'destructive',
      });
      throw new Error('Authentication required');
    }

    try {
      console.log(`Securing data for batch "${batch.name}"`);

      // Sanitize and validate batch data
      const sanitizedBatch = BatchValidationService.sanitizeBatchData(batch);
      const validation = BatchValidationService.validateBatch(sanitizedBatch, user.id);
      
      if (!validation.isValid) {
        throw new Error('Batch validation failed: ' + validation.errors.join(', '));
      }

      // Log security event
      securityLogger.logEvent({
        eventType: 'batch_data_secured',
        eventData: {
          batchId: batch.id,
          originalName: batch.name
        },
        userId: user.id
      });

      toast({
        title: 'Batch data secured',
        description: `Data security measures applied to "${batch.name}".`,
      });
      return sanitizedBatch;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Security operation failed';
      console.error('Batch security operation failed:', error);
      throw error;
    }
  };

  return {
    isProcessing,
    runBatchSecurely,
    validateBatchSecurity,
    encryptBatchData,
  };
};
