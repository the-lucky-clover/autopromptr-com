
// Enhanced error handling with specific error types for Chrome/Puppeteer issues
export class AutoPromtrError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly userMessage: string;
  public readonly technicalDetails?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number = 0,
    retryable: boolean = false,
    userMessage?: string,
    technicalDetails?: string
  ) {
    super(message);
    this.name = 'AutoPromtrError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryable = retryable;
    this.userMessage = userMessage || message;
    this.technicalDetails = technicalDetails;
    
    // Ensure the error is properly recognized as an Error instance
    Object.setPrototypeOf(this, AutoPromtrError.prototype);
  }

  static fromBackendError(error: any): AutoPromtrError {
    const message = error.message || 'Unknown backend error';
    
    // Chrome/Puppeteer specific error handling
    if (message.includes('Could not find Chrome')) {
      return new AutoPromtrError(
        'Chrome browser not available',
        'CHROME_NOT_FOUND',
        500,
        false,
        'The automation backend is missing Chrome browser. This is a deployment configuration issue.',
        'Chrome needs to be installed in the backend environment. Check Dockerfile and build scripts.'
      );
    }
    
    if (message.includes('Browser not found') || message.includes('Puppeteer')) {
      return new AutoPromtrError(
        'Browser automation service unavailable',
        'BROWSER_SERVICE_UNAVAILABLE',
        503,
        true,
        'The browser automation service is temporarily unavailable. Please try again in a few minutes.',
        'Backend browser service needs configuration or restart'
      );
    }
    
    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      return new AutoPromtrError(
        'Request timeout',
        'REQUEST_TIMEOUT',
        408,
        true,
        'The automation request timed out. This may be due to heavy load or slow response times.',
        'Consider increasing timeout limits or optimizing automation speed'
      );
    }
    
    if (message.includes('Connection refused') || message.includes('ECONNREFUSED')) {
      return new AutoPromtrError(
        'Backend connection failed',
        'CONNECTION_REFUSED',
        503,
        true,
        'Cannot connect to the automation backend. The service may be restarting.',
        'Backend service may be down or restarting'
      );
    }
    
    if (message.includes('rate limit') || message.includes('429')) {
      return new AutoPromtrError(
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        429,
        true,
        'Too many requests. Please wait a moment before trying again.',
        'Backend rate limiting is active'
      );
    }
    
    // Generic error handling
    return new AutoPromtrError(
      message,
      'BACKEND_ERROR',
      error.status || 500,
      true,
      'An unexpected error occurred during automation. Please try again.',
      message
    );
  }
}
