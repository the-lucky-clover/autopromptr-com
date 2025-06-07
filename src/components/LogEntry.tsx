
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

interface LogEntryData {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  system: string;
  message: string;
  details?: string;
}

interface LogEntryProps {
  log: LogEntryData;
}

const LogEntry = ({ log }: LogEntryProps) => {
  const getLogIcon = (type: LogEntryData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 text-sm">
      <div className="flex-shrink-0 mt-0.5">
        {getLogIcon(log.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-white/80 font-medium">[{log.system}]</span>
          <span className="text-white/60 text-xs">
            {log.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-white/90">{log.message}</p>
        {log.details && (
          <p className="text-white/60 text-xs mt-1">{log.details}</p>
        )}
      </div>
    </div>
  );
};

export default LogEntry;
