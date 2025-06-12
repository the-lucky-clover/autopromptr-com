
import { CircuitBreakerState, MAX_FAILURES, CIRCUIT_BREAKER_TIMEOUT } from './HealthStatusTypes';

// Circuit breaker state management
export const circuitBreakerState = {
  primaryBackend: { failures: 0, isOpen: false, lastFailure: 0 },
  fallbackBackend: { failures: 0, isOpen: false, lastFailure: 0 }
};

export const checkCircuitBreaker = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
  const state = circuitBreakerState[backendKey];
  const now = Date.now();
  
  if (state.isOpen) {
    if (now - state.lastFailure > CIRCUIT_BREAKER_TIMEOUT) {
      console.log(`Circuit breaker reset for ${backendKey}`);
      state.isOpen = false;
      state.failures = 0;
      return false;
    }
    return true;
  }
  return false;
};

export const recordFailure = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
  const state = circuitBreakerState[backendKey];
  state.failures++;
  state.lastFailure = Date.now();
  
  if (state.failures >= MAX_FAILURES) {
    state.isOpen = true;
    console.log(`Circuit breaker opened for ${backendKey} after ${state.failures} failures`);
  }
};

export const recordSuccess = (backendKey: 'primaryBackend' | 'fallbackBackend') => {
  const state = circuitBreakerState[backendKey];
  state.failures = 0;
  state.isOpen = false;
};
