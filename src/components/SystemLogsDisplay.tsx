
import { ScrollArea } from '@/components/ui/scroll-area';
import LogEntry from './LogEntry';

interface LogEntryData {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  system: string;
  message: string;
  details?: string;
}

interface SystemLogsDisplayProps {
  logs: LogEntryData[];
  hasActiveBatch: boolean;
}

const SystemLogsDisplay = ({ logs, hasActiveBatch }: SystemLogsDisplayProps) => {
  return (
    <div>
      <h4 className="text-white font-medium mb-3">System Logs</h4>
      <ScrollArea className="h-64 bg-white/5 rounded-xl p-3">
        {logs.length === 0 ? (
          <p className="text-white/60 text-sm">
            {hasActiveBatch 
              ? "Starting diagnostics for active batch..." 
              : "No active batches. System logs will appear when batches are being processed."}
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SystemLogsDisplay;
