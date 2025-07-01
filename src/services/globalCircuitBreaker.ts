
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
  lastSuccessTime: number;
  backoffLevel: number;
  errorType: 'cors' | 'network' | 'timeout' | 'server' | null;
}

export class GlobalCircuitBreaker {
  private static instance: GlobalCircuitBreaker;
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextRetryTime: 0,
    lastSuccessTime: 0,
    backoffLevel: 0,
    errorType: null
  };

  private readonly MAX_FAILURES = 2; // Reduced from 3
  private readonly BASE_BACKOFF = 30000; // Start at 30 seconds
  private readonly MAX_BACKOFF = 1800000; // Max 30 minutes
  private readonly CORS_BACKOFF = 1800000; // 30 minutes for CORS
  private readonly GRACE_PERIOD = 3600000; // 1 hour grace period after 3 failures

  private pendingRequest: Promise<any> | null = null;
  private requestQueue: Array<{ resolve: Function; reject: Function }> = [];

  static getInstance(): GlobalCircuitBreaker {
    if (!GlobalCircuitBreaker.instance) {
      GlobalCircuitBreaker.instance = new GlobalCircuitBreaker();
    }
    return GlobalCircuitBreaker.instance;
  }

  private categorizeError(error: Error): 'cors' | 'network' | 'timeout' | 'server' {
    const message = error.message.toLowerCase();
    
    if (message.includes('cors') || message.includes('access-control') || message.includes('failed to fetch')) {
      return 'cors';
    }
    if (message.includes('timeout') || message.includes('aborted')) {
      return 'timeout';
    }
    if (message.includes('5')) { // 5xx server errors
      return 'server';
    }
    return 'network';
  }

  private calculateBackoff(errorType: string, level: number): number {
    if (errorType === 'cors') {
      return this.CORS_BACKOFF; // Immediate long backoff for CORS
    }
    
    const backoff = this.BASE_BACKOFF * Math.pow(2, level);
    return Math.min(backoff, this.MAX_BACKOFF);
  }

  canMakeRequest(): { allowed: boolean; reason?: string; nextRetryIn?: number } {
    const now = Date.now();
    
    // Check if we're in grace period (after too many failures)
    if (this.state.failureCount >= 3 && (now - this.state.lastFailureTime) < this.GRACE_PERIOD) {
      const gracePeriodRemaining = this.GRACE_PERIOD - (now - this.state.lastFailureTime);
      return {
        allowed: false,
        reason: 'Grace period active - too many failures',
        nextRetryIn: gracePeriodRemaining
      };
    }

    // Check circuit breaker
    if (this.state.isOpen) {
      if (now < this.state.nextRetryTime) {
        return {
          allowed: false,
          reason: `Circuit breaker open - ${this.state.errorType} error`,
          nextRetryIn: this.state.nextRetryTime - now
        };
      } else {
        // Reset circuit breaker
        this.state.isOpen = false;
        this.state.backoffLevel = Math.max(0, this.state.backoffLevel - 1);
      }
    }

    return { allowed: true };
  }

  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const canRequest = this.canMakeRequest();
    if (!canRequest.allowed) {
      throw new Error(canRequest.reason || 'Circuit breaker prevents request');
    }

    // If there's already a pending request, queue this one
    if (this.pendingRequest) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ resolve, reject });
      });
    }

    this.pendingRequest = this.executeRequest(requestFn);
    
    try {
      const result = await this.pendingRequest;
      this.onSuccess();
      
      // Process queued requests with the same result
      this.requestQueue.forEach(({ resolve }) => resolve(result));
      this.requestQueue = [];
      
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      
      // Reject queued requests
      this.requestQueue.forEach(({ reject }) => reject(error));
      this.requestQueue = [];
      
      throw error;
    } finally {
      this.pendingRequest = null;
    }
  }

  private async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, jitter));
      
      const result = await requestFn();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.lastSuccessTime = Date.now();
    this.state.failureCount = 0;
    this.state.isOpen = false;
    this.state.backoffLevel = Math.max(0, this.state.backoffLevel - 1);
    this.state.errorType = null;
    console.log('🔄 Circuit breaker: Request successful, state reset');
  }

  private onFailure(error: Error): void {
    const now = Date.now();
    const errorType = this.categorizeError(error);
    
    this.state.failureCount++;
    this.state.lastFailureTime = now;
    this.state.errorType = errorType;
    
    if (this.state.failureCount >= this.MAX_FAILURES) {
      this.state.isOpen = true;
      this.state.backoffLevel = Math.min(this.state.backoffLevel + 1, 5);
      
      const backoffTime = this.calculateBackoff(errorType, this.state.backoffLevel);
      this.state.nextRetryTime = now + backoffTime;
      
      console.log(`🚫 Circuit breaker opened: ${errorType} error, backoff: ${backoffTime}ms`);
    }
  }

  getState(): CircuitBreakerState & { status: string; nextRetryIn: number } {
    const now = Date.now();
    let status = 'healthy';
    
    if (this.state.failureCount >= 3 && (now - this.state.lastFailureTime) < this.GRACE_PERIOD) {
      status = 'grace_period';
    } else if (this.state.isOpen) {
      status = 'circuit_open';
    } else if (this.state.failureCount > 0) {
      status = 'degraded';
    }
    
    return {
      ...this.state,
      status,
      nextRetryIn: Math.max(0, this.state.nextRetryTime - now)
    };
  }

  reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextRetryTime: 0,
      lastSuccessTime: 0,
      backoffLevel: 0,
      errorType: null
    };
    this.pendingRequest = null;
    this.requestQueue = [];
    console.log('🔄 Circuit breaker manually reset');
  }
}
