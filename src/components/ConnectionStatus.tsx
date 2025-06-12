
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';
import { useAuth } from '@/hooks/useAuth';
import RealTimeClock from './RealTimeClock';

// Circuit breaker state
const connectionCircuitBreaker = {
  failures: 0,
  isOpen: false,
  lastFailure: 0,
  maxFailures: 5,
  timeout: 600000 // 10 minutes
};

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'offline'>('connected');
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
        console.log('ConnectionStatus: Circuit breaker reset');
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
      console.log('ConnectionStatus: Circuit breaker opened');
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
        setStatus('offline'); // Circuit breaker active
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
      console.log('ConnectionStatus: Connection check failed (silenced)');
      setStatus('connected'); // Be optimistic to reduce noise
      recordConnectionFailure();
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
    
    // Only set up interval for dashboard users, and with longer intervals
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      return;
    }

    // Much longer interval - every 5 minutes
    const interval = setInterval(checkConnection, 300000);
    return () => clearInterval(interval);
  }, [user, isEmailVerified]);

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
            <Wifi className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            <WifiOff className="h-3 w-3 mr-1" />
            Protected Mode
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-end space-x-4">
      {getStatusBadge()}
      <div className="flex justify-end">
        <RealTimeClock />
      </div>
    </div>
  );
};
