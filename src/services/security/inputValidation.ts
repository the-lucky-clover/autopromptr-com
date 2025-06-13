
import DOMPurify from 'dompurify';

export class InputValidationService {
  // XSS Protection - Sanitize HTML content
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false
    });
  }

  // SQL Injection Protection - Basic input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  // URL Validation
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only allow https and http protocols
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  // File type validation
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // File size validation (in bytes)
  static validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // Validate batch name
  static validateBatchName(name: string): { isValid: boolean; error?: string } {
    const sanitized = this.sanitizeInput(name);
    
    if (!sanitized || sanitized.length < 3) {
      return { isValid: false, error: 'Batch name must be at least 3 characters long' };
    }
    
    if (sanitized.length > 100) {
      return { isValid: false, error: 'Batch name must be less than 100 characters' };
    }
    
    return { isValid: true };
  }

  // Validate prompt text
  static validatePromptText(text: string): { isValid: boolean; error?: string } {
    const sanitized = this.sanitizeInput(text);
    
    if (!sanitized || sanitized.length < 1) {
      return { isValid: false, error: 'Prompt text cannot be empty' };
    }
    
    if (sanitized.length > 5000) {
      return { isValid: false, error: 'Prompt text must be less than 5000 characters' };
    }
    
    return { isValid: true };
  }
}
