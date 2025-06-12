
import { AutoPromptr, AutoPromtrError } from './autoPromptr';
import { ConnectionDiagnostics } from './connectionDiagnostics';
import { RedundantAutoPromptr } from './redundantAutoPromptr';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  private configuredUrl: string;
  private connectionDiagnostics: ConnectionDiagnostics;
  private simplifiedSystem: RedundantAutoPromptr;
  private validationCache: { isValid: boolean; timestamp: number } | null = null;
  private readonly VALIDATION_CACHE_DURATION = 300000; // 5 minutes cache
  private circuitBreakerOpen: boolean = false;
  private validationFailureCount: number = 0;
  private readonly MAX_VALIDATION_FAILURES = 2; // Reduced from 3
  private lastValidationAttempt: number = 0;
  private readonly MIN_VALIDATION_INTERVAL = 60000; // 1 minute minimum between attempts

  constructor() {
    const savedUrl = 'https://autopromptr-backend.onrender.com';
    super(savedUrl);
    this.configuredUrl = savedUrl;
    this.connectionDiagnostics = new ConnectionDiagnostics(savedUrl);
    this.simplifiedSystem = new RedundantAutoPromptr();
    
    console.log('🔧 Enhanced AutoPromptr initialized with improved circuit breaker');
  }

  async validateConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Rate limiting - don't validate too frequently
    if ((now - this.lastValidationAttempt) < this.MIN_VALIDATION_INTERVAL) {
      console.log('Validation rate limited - using cached result');
      return this.validationCache?.isValid ?? true;
    }
    
    // Return cached validation if recent
    if (this.validationCache && (now - this.validationCache.timestamp) < this.VALIDATION_CACHE_DURATION) {
      console.log('Using cached validation result:', this.validationCache.isValid);
      return this.validationCache.isValid;
    }

    // Skip validation entirely on public pages
    if (!window.location.pathname.includes('/dashboard')) {
      console.log('Skipping validation on public page');
      this.validationCache = { isValid: true, timestamp: now };
      return true;
    }

    // Enhanced circuit breaker pattern
    if (this.circuitBreakerOpen) {
      const timeSinceLastFailure = now - this.lastValidationAttempt;
      const backoffTime = Math.min(300000, 30000 * Math.pow(2, this.validationFailureCount)); // Exponential backoff up to 5 minutes
      
      if (timeSinceLastFailure < backoffTime) {
        console.log(`Validation circuit breaker is open - next attempt in ${Math.round((backoffTime - timeSinceLastFailure) / 1000)}s`);
        this.validationCache = { isValid: false, timestamp: now };
        return false;
      } else {
        console.log('Circuit breaker timeout expired - attempting validation');
        this.circuitBreakerOpen = false;
      }
    }

    this.lastValidationAttempt = now;

    try {
      console.log('🔍 Performing optimized connection validation with enhanced circuit breaker...');
      
      // Add timeout to validation
      const validationPromise = this.simplifiedSystem.validateConnections();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Validation timeout')), 10000)
      );
      
      const connectionStatus = await Promise.race([validationPromise, timeoutPromise]) as any;
      
      // Consider connection valid if backend is working
      const isValid = connectionStatus.primary || false;
      
      console.log('✅ Enhanced validation result:', {
        primary: connectionStatus.primary,
        overall: isValid,
        recommendation: connectionStatus.recommendation
      });
      
      // Reset failure count on success
      if (isValid) {
        this.validationFailureCount = 0;
        if (this.circuitBreakerOpen) {
          this.circuitBreakerOpen = false;
          console.log('Validation circuit breaker reset - connection restored');
        }
      } else {
        this.handleValidationFailure();
      }
      
      this.validationCache = { isValid, timestamp: now };
      return isValid;
      
    } catch (err) {
      console.log('Validation failed with error:', err instanceof Error ? err.message : 'Unknown error');
      this.handleValidationFailure();
      
      // Return false for validation failures instead of being optimistic
      this.validationCache = { isValid: false, timestamp: now };
      return false;
    }
  }

  private handleValidationFailure() {
    this.validationFailureCount++;
    
    if (this.validationFailureCount >= this.MAX_VALIDATION_FAILURES) {
      this.circuitBreakerOpen = true;
      console.log(`Enhanced circuit breaker opened after ${this.validationFailureCount} failures`);
    }
  }

  async runBatchWithValidation(batch: Batch, platform: string, options: any = {}) {
    console.log('🚀 Starting enhanced batch run with improved error handling...');
    
    // Enhanced validation with better error handling
    const isValid = await this.validateConnection();
    if (!isValid && this.circuitBreakerOpen) {
      throw new AutoPromtrError(
        'Backend services are currently unavailable. Circuit breaker is active.',
        'BACKEND_UNAVAILABLE',
        503,
        true
      );
    }
    
    const enhancedOptions = {
      waitForIdle: options.waitForIdle ?? true,
      maxRetries: Math.min(options.maxRetries ?? 1, 1), // Reduced retries to prevent long waits
      timeout: 30000, // 30 second timeout
      ...options
    };
    
    try {
      console.log('🎯 Starting batch with enhanced options:', enhancedOptions);
      
      const result = await this.simplifiedSystem.runBatchWithRedundancy(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch completed successfully');
      
      // Reset circuit breaker on successful batch run
      this.validationFailureCount = 0;
      this.circuitBreakerOpen = false;
      
      return result;
      
    } catch (err) {
      console.error('❌ Enhanced batch failed:', err);
      
      // Clear validation cache on failure
      this.validationCache = null;
      
      // Categorize errors better
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          throw new AutoPromtrError(
            'Failed to connect to backend services. Please check your internet connection.',
            'CONNECTION_FAILED',
            0,
            true
          );
        } else if (err.message.includes('timeout')) {
          throw new AutoPromtrError(
            'Backend request timed out. The service may be overloaded.',
            'REQUEST_TIMEOUT',
            408,
            true
          );
        }
      }
      
      if (err instanceof AutoPromtrError) {
        throw err;
      }
      
      throw new AutoPromtrError(
        'Enhanced batch processing failed due to an unexpected error',
        'ENHANCED_BATCH_FAILED',
        500,
        true
      );
    }
  }

  getConfiguredUrl(): string {
    return this.configuredUrl;
  }

  async getDiagnostics() {
    // Return cached diagnostics to avoid unnecessary requests during circuit breaker
    if (this.circuitBreakerOpen) {
      return {
        overallSuccess: false,
        configuredUrl: this.configuredUrl,
        endpointResults: [],
        networkEnvironment: {
          hasAdBlocker: false,
          hasCorsIssues: true,
          networkType: 'unknown',
          isOnline: navigator.onLine
        },
        circuitBreaker: {
          isOpen: this.circuitBreakerOpen,
          failureCount: this.validationFailureCount,
          nextRetryIn: this.getNextRetryTime()
        },
        simplifiedMode: {
          primary: false,
          recommendation: 'Service temporarily unavailable - enhanced circuit breaker active',
          configuration: this.simplifiedSystem.getBackendConfiguration()
        }
      };
    }

    try {
      const standardDiagnostics = await this.connectionDiagnostics.runComprehensiveTest();
      const backendStatus = await this.simplifiedSystem.validateConnections();
      const backendConfig = this.simplifiedSystem.getBackendConfiguration();
      
      return {
        ...standardDiagnostics,
        circuitBreaker: {
          isOpen: this.circuitBreakerOpen,
          failureCount: this.validationFailureCount,
          nextRetryIn: this.getNextRetryTime()
        },
        simplifiedMode: {
          primary: backendStatus.primary,
          recommendation: backendStatus.recommendation,
          configuration: backendConfig
        }
      };
    } catch (err) {
      // Return enhanced diagnostics on error
      return {
        overallSuccess: false,
        configuredUrl: this.configuredUrl,
        endpointResults: [],
        networkEnvironment: {
          hasAdBlocker: false,
          hasCorsIssues: true,
          networkType: 'unknown',
          isOnline: navigator.onLine
        },
        circuitBreaker: {
          isOpen: this.circuitBreakerOpen,
          failureCount: this.validationFailureCount,
          nextRetryIn: this.getNextRetryTime()
        },
        simplifiedMode: {
          primary: false,
          recommendation: 'Enhanced diagnostics failed - operating in degraded mode',
          configuration: this.simplifiedSystem.getBackendConfiguration()
        }
      };
    }
  }

  private getNextRetryTime(): number {
    if (!this.circuitBreakerOpen) return 0;
    
    const now = Date.now();
    const timeSinceLastFailure = now - this.lastValidationAttempt;
    const backoffTime = Math.min(300000, 30000 * Math.pow(2, this.validationFailureCount));
    
    return Math.max(0, backoffTime - timeSinceLastFailure);
  }

  getSimplifiedStatus() {
    return {
      ...this.simplifiedSystem.getBackendConfiguration(),
      circuitBreaker: {
        isOpen: this.circuitBreakerOpen,
        failureCount: this.validationFailureCount,
        nextRetryIn: this.getNextRetryTime()
      }
    };
  }

  // Method to reset circuit breakers
  resetCircuitBreakers() {
    this.circuitBreakerOpen = false;
    this.validationFailureCount = 0;
    this.validationCache = null;
    this.lastValidationAttempt = 0;
    console.log('Enhanced circuit breaker manually reset');
  }

  // Get circuit breaker status
  getCircuitBreakerStatus() {
    return {
      isOpen: this.circuitBreakerOpen,
      failureCount: this.validationFailureCount,
      maxFailures: this.MAX_VALIDATION_FAILURES,
      nextRetryIn: this.getNextRetryTime(),
      lastAttempt: this.lastValidationAttempt
    };
  }
}
