
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
  batches: any[];
  isCompact?: boolean;
}

const SystemLogsDisplay = ({ batches, isCompact = false }: SystemLogsDisplayProps) => {
  // Generate mock logs based on batches
  const logs: LogEntryData[] = batches.flatMap(batch => [
    {
      id: `${batch.id}-init`,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      type: batch.status === 'running' ? 'info' : batch.status === 'completed' ? 'success' : 'warning',
      system: 'Batch Processor',
      message: `Batch "${batch.name}" ${batch.status === 'running' ? 'initialized' : batch.status === 'completed' ? 'completed successfully' : 'pending execution'}`,
      details: `${batch.prompts?.length || 0} prompts queued`
    }
  ]).slice(0, 10);

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  if (isCompact) {
    return (
      <ScrollArea className="h-16 bg-white/5 rounded-lg p-2">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/60 text-xs text-center">
              {hasActiveBatch 
                ? "Starting diagnostics..." 
                : "No active batches"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.slice(0, 2).map((log) => (
              <div key={log.id} className="text-xs">
                <LogEntry log={log} />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    );
  }

  return (
    <div className="space-y-4">
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
