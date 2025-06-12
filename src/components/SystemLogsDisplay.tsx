
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
    <div className="space-y-4">
      <h4 className="text-white font-medium">System Logs</h4>
      <ScrollArea className="h-64 bg-white/5 rounded-xl p-4">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60 text-sm text-center leading-relaxed">
              {hasActiveBatch 
                ? "Starting diagnostics for active batch..." 
                : "No active batches. System logs will appear when batches are being processed."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
