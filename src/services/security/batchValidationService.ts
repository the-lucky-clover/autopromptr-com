import { Batch } from '@/types/batch';
import { InputValidationService } from './inputValidation';
import { securityLogger } from './securityLogger';

export interface BatchValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class BatchValidationService {
  static validateBatch(batch: Batch, userId: string): BatchValidationResult {
    const result: BatchValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate batch name
    const nameValidation = InputValidationService.validateBatchName(batch.name);
    if (!nameValidation.isValid) {
      result.isValid = false;
      result.errors.push(nameValidation.error || 'Invalid batch name');
    }

    // Validate description if present
    if (batch.description) {
      const sanitizedDescription = InputValidationService.sanitizeInput(batch.description);
      if (sanitizedDescription.length > 500) {
        result.isValid = false;
        result.errors.push('Description must be less than 500 characters');
      }
    }

    // Validate platform
    const allowedPlatforms = ['lovable', 'v0', 'cursor', 'windsurf', 'local'];
    if (!allowedPlatforms.includes(batch.platform)) {
      result.isValid = false;
      result.errors.push('Invalid platform specified');
    }

    // Validate target URL if provided in settings
    if (batch.settings?.targetUrlOverride) {
      const urlValidation = InputValidationService.validateUrl(batch.settings.targetUrlOverride);
      if (!urlValidation.isValid) {
        result.isValid = false;
        result.errors.push(urlValidation.error || 'Invalid target URL');
      }

      // Check for potential SSRF attacks
      const url = new URL(batch.settings.targetUrlOverride);
      const hostname = url.hostname.toLowerCase();
      
      // Block private IP ranges and localhost
      const blockedHosts = [
        'localhost', '127.0.0.1', '0.0.0.0',
        '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
        '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.',
        '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.', '169.254.'
      ];
      
      if (blockedHosts.some(blocked => hostname.includes(blocked))) {
        result.isValid = false;
        result.errors.push('Target URL cannot point to private or local addresses');
      }
    }

    // Note: Ownership validation is handled by RLS policies at the database level

    // Log validation attempt
    securityLogger.logEvent({
      eventType: 'batch_validation',
      eventData: {
        batchId: batch.id,
        isValid: result.isValid,
        errorCount: result.errors.length,
        platform: batch.platform
      },
      userId
    });

    return result;
  }

  static validatePromptContent(promptText: string): BatchValidationResult {
    const result: BatchValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const promptValidation = InputValidationService.validatePromptText(promptText);
    if (!promptValidation.isValid) {
      result.isValid = false;
      result.errors.push(promptValidation.error || 'Invalid prompt text');
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [
      /system\s*\(.*\)/gi,
      /exec\s*\(.*\)/gi,
      /eval\s*\(.*\)/gi,
      /__import__/gi,
      /subprocess/gi,
      /shell_exec/gi
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(promptText));
    if (hasDangerousContent) {
      result.warnings.push('Prompt contains potentially dangerous code execution patterns');
    }

    return result;
  }

  static sanitizeBatchData(batch: Batch): Batch {
    return {
      ...batch,
      name: InputValidationService.sanitizeInput(batch.name),
      description: batch.description ? InputValidationService.sanitizeInput(batch.description) : undefined,
      settings: batch.settings ? {
        ...batch.settings,
        targetUrlOverride: batch.settings.targetUrlOverride ? batch.settings.targetUrlOverride.trim() : undefined
      } : undefined
    };
  }
}