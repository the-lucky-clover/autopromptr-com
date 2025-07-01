
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';
import { useAuth } from '@/hooks/useAuth';

// Circuit breaker state
const connectionCircuitBreaker = {
  failures: 0,
  isOpen: false,
  lastFailure: 0,
  maxFailures: 3,
  timeout: 300000 // 5 minutes
};

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'protected'>('connected');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { user, isEmailVerified } = useAuth();

  const shouldRunConnectionCheck = () => {
    // Only run for authenticated users on dashboard pages
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      return false;
    }

    // Check circuit breaker
    if (connectionCircuitBreaker.isOpen) {
      const now = Date.now();
      if (now - connectionCircuitBreaker.lastFailure > connectionCircuitBreaker.timeout) {
        connectionCircuitBreaker.isOpen = false;
        connectionCircuitBreaker.failures = 0;
        return true;
      }
      return false;
    }

    return true;
  };

  const recordConnectionFailure = () => {
    connectionCircuitBreaker.failures++;
    connectionCircuitBreaker.lastFailure = Date.now();
    
    if (connectionCircuitBreaker.failures >= connectionCircuitBreaker.maxFailures) {
      connectionCircuitBreaker.isOpen = true;
    }
  };

  const recordConnectionSuccess = () => {
    connectionCircuitBreaker.failures = 0;
    connectionCircuitBreaker.isOpen = false;
  };

  const checkConnection = async () => {
    if (!shouldRunConnectionCheck()) {
      // Set appropriate status based on why we're skipping
      if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
        setStatus('connected'); // Assume healthy on public pages
      } else if (connectionCircuitBreaker.isOpen) {
        setStatus('protected'); // Circuit breaker active
      }
      setLastChecked(new Date());
      return;
    }

    setStatus('checking');
    try {
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      await enhancedAutoPromptr.validateConnection();
      setStatus('connected');
      recordConnectionSuccess();
    } catch (err) {
      // Reduced logging - only log first failure
      if (connectionCircuitBreaker.failures === 0) {
        console.log('ConnectionStatus: Backend connection failed, enabling circuit breaker protection');
      }
      setStatus('disconnected');
      recordConnectionFailure();
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
    
    // Only set up interval for dashboard users, with longer intervals
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      return;
    }

    // Check every 10 minutes instead of 5 to reduce API calls
    const interval = setInterval(checkConnection, 600000);
    return () => clearInterval(interval);
  }, [user, isEmailVerified]);

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">
            <Wifi className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'protected':
        return (
          <Badge variant="outline" className="bg-purple-500/20 text-purple-700 border-purple-500/30">
            <WifiOff className="h-3 w-3 mr-1" />
            Protected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
    }
  };

  return getStatusBadge();
};
