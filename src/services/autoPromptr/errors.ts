
// Enhanced error handling with specific error types
export class AutoPromtrError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 0,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AutoPromtrError';
    this.statusCode = statusCode;
    this.code = code;
    this.retryable = retryable;
    
    // Ensure the error is properly recognized as an Error instance
    Object.setPrototypeOf(this, AutoPromtrError.prototype);
  }
}
