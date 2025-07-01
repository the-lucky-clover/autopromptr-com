
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorsProps {
  status: string;
  circuitBreakerState?: any;
}

export const StatusLight = ({ status }: { status: string }) => {
  switch (status) {
    case 'healthy':
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
          <span className="text-green-400 font-medium">All Systems Operational</span>
        </div>
      );
    case 'degraded':
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
          <span className="text-yellow-400 font-medium">Performance Degraded</span>
        </div>
      );
    case 'unhealthy':
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
          <span className="text-red-400 font-medium">Backend Unreachable</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-400 font-medium">Status Unknown</span>
        </div>
      );
  }
};

export const StatusBadge = ({ status, circuitBreakerState }: StatusIndicatorsProps) => {
  if (circuitBreakerState?.status === 'grace_period') {
    return (
      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
        RECOVERY
      </Badge>
    );
  }
  
  if (circuitBreakerState?.status === 'circuit_open') {
    return (
      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
        PROTECTED
      </Badge>
    );
  }

  switch (status) {
    case 'healthy':
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
          OPERATIONAL
        </Badge>
      );
    case 'degraded':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
          DEGRADED
        </Badge>
      );
    case 'unhealthy':
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1">
          UNREACHABLE
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1">
          UNKNOWN
        </Badge>
      );
  }
};
