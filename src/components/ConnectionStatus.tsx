
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      await enhancedAutoPromptr.validateConnection();
      setStatus('connected');
    } catch (err) {
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

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
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusBadge()}
      {lastChecked && (
        <span className="text-xs text-purple-300">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
