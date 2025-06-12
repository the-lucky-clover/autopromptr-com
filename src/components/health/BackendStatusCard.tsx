
import { BackendStatus } from './HealthStatusTypes';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  AlertTriangle,
  XCircle,
  WifiOff,
  Server
} from 'lucide-react';

interface BackendStatusCardProps {
  backend: BackendStatus;
  isCompact?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-400 border-green-400 bg-green-400/20';
    case 'degraded': return 'text-yellow-400 border-yellow-400 bg-yellow-400/20';
    case 'unhealthy': return 'text-red-400 border-red-400 bg-red-400/20';
    default: return 'text-gray-400 border-gray-400 bg-gray-400/20';
  }
};

const getStatusIcon = (backend: BackendStatus) => {
  if (!backend.isConnected) return <XCircle className="w-4 h-4" />;
  
  switch (backend.status) {
    case 'healthy': return <CheckCircle className="w-4 h-4" />;
    case 'degraded': return <AlertTriangle className="w-4 h-4" />;
    case 'unhealthy': return <WifiOff className="w-4 h-4" />;
    default: return <Server className="w-4 h-4" />;
  }
};

const formatResponseTime = (ms: number) => {
  if (ms === 0) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const CompactBackendCard = ({ backend }: { backend: BackendStatus }) => (
  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center space-x-1">
        <span className="text-purple-300 text-xs font-mono">{backend.icon}</span>
        <span className="text-white font-medium text-xs">{backend.shortName}</span>
      </div>
      <div className="flex items-center space-x-1">
        {getStatusIcon(backend)}
        <Badge className={`${getStatusColor(backend.status)} text-[10px] px-1 py-0`}>
          {backend.isConnected ? backend.status.charAt(0).toUpperCase() : 'OFF'}
        </Badge>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-1 text-[10px]">
      <div>
        <div className="text-purple-300">Response</div>
        <div className={`font-semibold ${backend.isConnected ? 'text-blue-400' : 'text-red-400'}`}>
          {formatResponseTime(backend.responseTime)}
        </div>
      </div>
      <div>
        <div className="text-purple-300">Status</div>
        <div className={`font-semibold ${backend.isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {backend.uptime}
        </div>
      </div>
    </div>
  </div>
);

export const BackendCard = ({ backend }: { backend: BackendStatus }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        {getStatusIcon(backend)}
        <span className="text-white font-medium text-sm">{backend.name}</span>
      </div>
      <Badge className={`${getStatusColor(backend.status)} text-xs px-2 py-1`}>
        {backend.isConnected ? backend.status.toUpperCase() : 'OFFLINE'}
      </Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <div className="text-purple-300 mb-1">Response Time</div>
        <div className={`font-semibold ${backend.isConnected ? 'text-blue-400' : 'text-red-400'}`}>
          {formatResponseTime(backend.responseTime)}
        </div>
      </div>
      <div>
        <div className="text-purple-300 mb-1">Connection</div>
        <div className={`font-semibold ${backend.isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {backend.uptime}
        </div>
      </div>
    </div>
    
    <div className="mt-3 text-xs text-purple-300 break-all">
      {backend.url}
    </div>
    
    <div className="mt-2 text-xs text-gray-400">
      Last checked: {backend.lastChecked.toLocaleTimeString()}
    </div>
  </div>
);

const BackendStatusCard = ({ backend, isCompact = false }: BackendStatusCardProps) => {
  if (isCompact) {
    return <CompactBackendCard backend={backend} />;
  }
  
  return <BackendCard backend={backend} />;
};

export default BackendStatusCard;
