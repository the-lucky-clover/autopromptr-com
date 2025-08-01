export class AutoPromptrError extends Error {
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
    this.name = 'AutoPromptrError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryable = retryable;
    this.userMessage = userMessage || message;
    this.technicalDetails = technicalDetails;

    Object.setPrototypeOf(this, AutoPromptrError.prototype);
  }

  // ✅ Add alias so error.status works like error.statusCode
  get status(): number {
    return this.statusCode;
  }

  static fromBackendError(error: any): AutoPromptrError {
    const message = error.message || 'Unknown backend error';

    if (message.includes('Could not find Chrome')) {
      return new AutoPromptrError(
        'Chrome browser not available',
        'CHROME_NOT_FOUND',
        500,
        false,
        'The automation backend is missing Chrome browser. This is a deployment configuration issue.',
        'Chrome needs to be installed in the backend environment. Check Dockerfile and build scripts.'
      );
    }

    if (message.includes('Browser not found') || message.includes('Puppeteer')) {
      return new AutoPromptrError(
        'Browser automation service unavailable',
        'BROWSER_SERVICE_UNAVAILABLE',
        503,
        true,
        'The browser automation service is temporarily unavailable. Please try again in a few minutes.',
        'Backend browser service needs configuration or restart'
      );
    }

    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      return new AutoPromptrError(
        'Request timeout',
        'REQUEST_TIMEOUT',
        408,
        true,
        'The automation request timed out. This may be due to heavy load or slow response times.',
        'Consider increasing timeout limits or optimizing automation speed'
      );
    }

    if (message.includes('Connection refused') || message.includes('ECONNREFUSED')) {
      return new AutoPromptrError(
        'Backend connection failed',
        'CONNECTION_REFUSED',
        503,
        true,
        'Cannot connect to the automation backend. The service may be restarting.',
        'Backend service may be down or restarting'
      );
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return new AutoPromptrError(
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        429,
        true,
        'Too many requests. Please wait a moment before trying again.',
        'Backend rate limiting is active'
      );
    }

    return new AutoPromptrError(
      message,
      'BACKEND_ERROR',
      error.status || error.statusCode || 500,
      true,
      'An unexpected error occurred during automation. Please try again.',
      message
    );
  }
}
