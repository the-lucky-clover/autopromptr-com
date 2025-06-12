
import { BackendStatus } from './HealthStatusTypes';
import { checkCircuitBreaker, recordFailure, recordSuccess } from './CircuitBreakerService';

export const checkBackendHealth = async (
  backend: BackendStatus, 
  setter: (status: BackendStatus) => void, 
  backendKey: 'primaryBackend' | 'fallbackBackend'
) => {
  // Skip if circuit breaker is open
  if (checkCircuitBreaker(backendKey)) {
    console.log(`Skipping health check for ${backend.name} - circuit breaker open`);
    setter({
      ...backend,
      status: 'unhealthy',
      uptime: 'Circuit Breaker Open',
      isConnected: false,
      lastChecked: new Date()
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // Reduced timeout from 8s to 6s
    
    const startTime = Date.now();
    
    const response = await fetch(backend.url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache', // Prevent caching issues
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    const isConnected = response.ok || response.status < 500;
    const status = isConnected 
      ? (responseTime > 3000 ? 'degraded' : 'healthy') // Reduced threshold from 5s to 3s
      : 'unhealthy';
    
    if (isConnected) {
      recordSuccess(backendKey);
    } else {
      recordFailure(backendKey);
    }
    
    setter({
      ...backend,
      status,
      responseTime,
      uptime: isConnected ? 'Connected' : 'Disconnected',
      lastChecked: new Date(),
      isConnected
    });
  } catch (error) {
    recordFailure(backendKey);
    
    let uptime = 'Connection Failed';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        uptime = 'Request Timeout';
      } else if (error.message.includes('fetch')) {
        uptime = 'Network Error';
      }
    }
    
    setter({
      ...backend,
      status: 'unhealthy',
      responseTime: 0,
      uptime,
      lastChecked: new Date(),
      isConnected: false
    });
  }
};
