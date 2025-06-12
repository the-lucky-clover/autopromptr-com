
// Enhanced error handling with specific error types
export class AutoPromtrError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AutoPromtrError';
  }
}
