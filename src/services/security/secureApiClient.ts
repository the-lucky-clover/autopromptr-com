
import { apiRateLimiter } from './rateLimiter';
import { InputValidationService } from './inputValidation';

export interface SecureApiOptions {
  timeout?: number;
  retries?: number;
  rateLimited?: boolean;
}

export class SecureApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async secureRequest(
    endpoint: string, 
    options: RequestInit & SecureApiOptions = {}
  ): Promise<Response> {
    const {
      timeout = this.defaultTimeout,
      retries = 3,
      rateLimited = true,
      ...fetchOptions
    } = options;

    // Rate limiting check
    if (rateLimited && !apiRateLimiter.isAllowed(endpoint)) {
      throw new Error('Rate limit exceeded for this endpoint');
    }

    // Input validation for URL
    const fullUrl = `${this.baseUrl}${endpoint}`;
    if (!InputValidationService.validateUrl(fullUrl)) {
      throw new Error('Invalid API endpoint URL');
    }

    // Secure headers
    const secureHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...fetchOptions.headers
    };

    // Timeout wrapper
    const fetchWithTimeout = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers: secureHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
    };

    // Retry logic
    let lastError: Error;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetchWithTimeout();
        
        // Security: Check for suspicious response headers
        this.validateResponseSecurity(response);
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on client errors (4xx) or rate limits
        if (attempt === retries || this.isNonRetryableError(lastError)) {
          break;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }

  private validateResponseSecurity(response: Response): void {
    // Check for potentially dangerous content types
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      console.warn('Unexpected content type:', contentType);
    }

    // Log suspicious status codes
    if (response.status >= 400) {
      console.warn('API error response:', response.status, response.statusText);
    }
  }

  private isNonRetryableError(error: Error): boolean {
    return error.message.includes('Rate limit') || 
           error.message.includes('Invalid') ||
           error.message.includes('4');
  }

  async get(endpoint: string, options?: SecureApiOptions): Promise<Response> {
    return this.secureRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options?: SecureApiOptions): Promise<Response> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.secureRequest(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint: string, data?: any, options?: SecureApiOptions): Promise<Response> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.secureRequest(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint: string, options?: SecureApiOptions): Promise<Response> {
    return this.secureRequest(endpoint, { ...options, method: 'DELETE' });
  }
}
