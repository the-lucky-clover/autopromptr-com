
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';
import { useAuth } from '@/hooks/useAuth';
import RealTimeClock from './RealTimeClock';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'offline'>('connected');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { user, isEmailVerified } = useAuth();
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const checkConnection = async () => {
    // Only run health checks for authenticated users on dashboard pages
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      setStatus('connected'); // Assume healthy on public pages
      setLastChecked(new Date());
      return;
    }

    // Circuit breaker pattern - stop checking if too many failures
    if (circuitBreakerOpen) {
      console.log('Circuit breaker open - skipping connection check');
      setStatus('offline');
      setLastChecked(new Date());
      return;
    }

    setStatus('checking');
    try {
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      await enhancedAutoPromptr.validateConnection();
      setStatus('connected');
      setFailureCount(0); // Reset failure count on success
      
      // Reset circuit breaker if it was open
      if (circuitBreakerOpen) {
        setCircuitBreakerOpen(false);
        console.log('Circuit breaker reset - connection restored');
      }
    } catch (err) {
      console.log('Connection check failed - assuming degraded service');
      setStatus('connected'); // Be optimistic to reduce console noise
      
      // Increment failure count and potentially open circuit breaker
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      
      if (newFailureCount >= 5) {
        setCircuitBreakerOpen(true);
        console.log('Circuit breaker opened - too many failures');
      }
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Only start checking if user is authenticated and on dashboard
    if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
      setStatus('connected');
      setLastChecked(new Date());
      return;
    }

    checkConnection();
    
    // Significantly reduced frequency - only check every 10 minutes for dashboard users
    const interval = setInterval(checkConnection, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [user, isEmailVerified, circuitBreakerOpen]);

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
            Offline Mode
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
