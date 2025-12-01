/**
 * Input Validation & Sanitization Utilities
 * Security hardening for user inputs
 */

// Maximum lengths for various inputs
export const MAX_LENGTHS = {
  PROMPT_TEXT: 10000,
  BATCH_NAME: 200,
  BATCH_DESCRIPTION: 1000,
  URL: 2048,
  PATH: 500
} as const;

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onload, etc.
  /data:text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi
];

/**
 * Validate and sanitize prompt text input
 */
export const validatePromptText = (text: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!text || typeof text !== 'string') {
    return { valid: false, sanitized: '', error: 'Prompt text must be a non-empty string' };
  }

  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Prompt text cannot be empty' };
  }

  if (trimmed.length > MAX_LENGTHS.PROMPT_TEXT) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `Prompt text exceeds maximum length of ${MAX_LENGTHS.PROMPT_TEXT} characters` 
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { 
        valid: false, 
        sanitized: '', 
        error: 'Prompt text contains potentially dangerous content' 
      };
    }
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Validate batch name
 */
export const validateBatchName = (name: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Batch name must be a non-empty string' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Batch name cannot be empty' };
  }

  if (trimmed.length > MAX_LENGTHS.BATCH_NAME) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `Batch name exceeds maximum length of ${MAX_LENGTHS.BATCH_NAME} characters` 
    };
  }

  // Remove any HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '');

  return { valid: true, sanitized };
};

/**
 * Validate URL input
 */
export const validateUrl = (url: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL must be a non-empty string' };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'URL cannot be empty' };
  }

  if (trimmed.length > MAX_LENGTHS.URL) {
    return { valid: false, sanitized: '', error: 'URL is too long' };
  }

  // Validate URL format
  try {
    const parsed = new URL(trimmed);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, sanitized: '', error: 'URL must use HTTP or HTTPS protocol' };
    }

    return { valid: true, sanitized: trimmed };
  } catch (error) {
    return { valid: false, sanitized: '', error: 'Invalid URL format' };
  }
};

/**
 * Validate local file path
 */
export const validateLocalPath = (path: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!path || typeof path !== 'string') {
    return { valid: false, sanitized: '', error: 'Path must be a non-empty string' };
  }

  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Path cannot be empty' };
  }

  if (trimmed.length > MAX_LENGTHS.PATH) {
    return { valid: false, sanitized: '', error: 'Path is too long' };
  }

  // Check for path traversal attempts
  if (trimmed.includes('../') || trimmed.includes('..\\')) {
    return { valid: false, sanitized: '', error: 'Path traversal detected' };
  }

  // Check for absolute paths that might access system files
  const dangerousPaths = ['/etc/', '/sys/', '/proc/', 'C:\\Windows\\', 'C:\\Program Files\\'];
  for (const dangerous of dangerousPaths) {
    if (trimmed.toLowerCase().startsWith(dangerous.toLowerCase())) {
      return { valid: false, sanitized: '', error: 'Access to system directories is not allowed' };
    }
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Sanitize log data to remove sensitive information
 */
export const sanitizeLogData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'session'
  ];

  const sanitizeObject = (obj: unknown): unknown => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        cleaned[key] = '[REDACTED]';
      } else if (key === 'promptText' && typeof value === 'string' && value.length > 100) {
        cleaned[key] = value.substring(0, 100) + '...[TRUNCATED]';
      } else if (typeof value === 'object') {
        cleaned[key] = sanitizeObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  return sanitizeObject(sanitized);
};

/**
 * Validate UUID format
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Rate limiting check (client-side)
 * Note: Real rate limiting should be done server-side
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkClientRateLimit = (
  key: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: limit.resetTime };
  }

  limit.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - limit.count, 
    resetTime: limit.resetTime 
  };
};

/**
 * Validate batch settings object
 */
export const validateBatchSettings = (settings: unknown): { valid: boolean; error?: string } => {
  if (!settings || typeof settings !== 'object') {
    return { valid: true }; // Settings are optional
  }

  // Validate specific settings
  if ('maxRetries' in settings) {
    if (typeof settings.maxRetries !== 'number' || settings.maxRetries < 0 || settings.maxRetries > 10) {
      return { valid: false, error: 'maxRetries must be a number between 0 and 10' };
    }
  }

  if ('timeout' in settings) {
    if (typeof settings.timeout !== 'number' || settings.timeout < 0 || settings.timeout > 300000) {
      return { valid: false, error: 'timeout must be a number between 0 and 300000 (5 minutes)' };
    }
  }

  return { valid: true };
};

/**
 * Comprehensive batch validation
 */
export interface BatchValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedBatch?: Record<string, unknown>;
}

export const validateBatch = (batch: unknown): BatchValidationResult => {
  const errors: string[] = [];
  const sanitizedBatch: Record<string, unknown> = {};

  // Type guard
  if (!batch || typeof batch !== 'object') {
    errors.push('Batch must be an object');
    return { valid: false, errors };
  }

  const batchObj = batch as Record<string, unknown>;

  // Validate ID
  if (!batchObj.id || !validateUUID(batchObj.id as string)) {
    errors.push('Invalid batch ID');
  } else {
    sanitizedBatch.id = batchObj.id;
  }

  // Validate name
  const nameResult = validateBatchName(batchObj.name as string);
  if (!nameResult.valid) {
    errors.push(nameResult.error || 'Invalid batch name');
  } else {
    sanitizedBatch.name = nameResult.sanitized;
  }

  // Validate description
  if (batchObj.description) {
    if ((batchObj.description as string).length > MAX_LENGTHS.BATCH_DESCRIPTION) {
      errors.push('Batch description is too long');
    } else {
      sanitizedBatch.description = (batchObj.description as string).trim();
    }
  }

  // Validate target URL or path
  if (batchObj.targetUrl) {
    if ((batchObj.targetUrl as string).startsWith('http')) {
      const urlResult = validateUrl(batchObj.targetUrl as string);
      if (!urlResult.valid) {
        errors.push(urlResult.error || 'Invalid target URL');
      } else {
        sanitizedBatch.targetUrl = urlResult.sanitized;
      }
    } else {
      const pathResult = validateLocalPath(batchObj.targetUrl as string);
      if (!pathResult.valid) {
        errors.push(pathResult.error || 'Invalid target path');
      } else {
        sanitizedBatch.targetUrl = pathResult.sanitized;
      }
    }
  }

  // Validate prompts
  if (!Array.isArray(batchObj.prompts) || (batchObj.prompts as unknown[]).length === 0) {
    errors.push('Batch must contain at least one prompt');
  } else {
    const sanitizedPrompts = [];
    const prompts = batchObj.prompts as Record<string, unknown>[];
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      
      if (!prompt.id || !validateUUID(prompt.id as string)) {
        errors.push(`Prompt ${i + 1} has invalid ID`);
        continue;
      }

      const textResult = validatePromptText(prompt.text as string);
      if (!textResult.valid) {
        errors.push(`Prompt ${i + 1}: ${textResult.error}`);
        continue;
      }

      sanitizedPrompts.push({
        id: prompt.id,
        text: textResult.sanitized,
        order: typeof prompt.order === 'number' ? prompt.order : i
      });
    }
    sanitizedBatch.prompts = sanitizedPrompts;
  }

  // Validate settings
  if (batchObj.settings) {
    const settingsResult = validateBatchSettings(batchObj.settings);
    if (!settingsResult.valid) {
      errors.push(settingsResult.error || 'Invalid batch settings');
    } else {
      sanitizedBatch.settings = batchObj.settings;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedBatch: errors.length === 0 ? sanitizedBatch : undefined
  };
};
