
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Server, AlertCircle } from 'lucide-react';

interface RenderSyslogEntry {
  id: string;
  batch_id?: string;
  timestamp: string;
  severity: number;
  facility: number;
  hostname?: string;
  app_name?: string;
  proc_id?: string;
  msg_id?: string;
  message: string;
  structured_data?: any;
  raw_message?: string;
  created_at: string;
}

interface RenderSyslogDisplayProps {
  batchId?: string | null;
  maxEntries?: number;
}

const RenderSyslogDisplay = ({ batchId, maxEntries = 50 }: RenderSyslogDisplayProps) => {
  const [syslogEntries, setSyslogEntries] = useState<RenderSyslogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSeverityInfo = (severity: number) => {
    const severityMap = {
      0: { label: 'Emergency', color: 'bg-red-600', icon: '🚨' },
      1: { label: 'Alert', color: 'bg-red-500', icon: '🔴' },
      2: { label: 'Critical', color: 'bg-red-400', icon: '💥' },
      3: { label: 'Error', color: 'bg-red-300', icon: '❌' },
      4: { label: 'Warning', color: 'bg-yellow-400', icon: '⚠️' },
      5: { label: 'Notice', color: 'bg-blue-400', icon: 'ℹ️' },
      6: { label: 'Info', color: 'bg-blue-300', icon: '📋' },
      7: { label: 'Debug', color: 'bg-gray-400', icon: '🔍' }
    };
    return severityMap[severity as keyof typeof severityMap] || severityMap[6];
  };

  const fetchSyslogEntries = async () => {
    try {
      let query = supabase
        .from('render_syslog')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(maxEntries);

      if (batchId) {
        query = query.eq('batch_id', batchId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching syslog entries:', error);
        return;
      }

      setSyslogEntries(data || []);
    } catch (error) {
      console.error('Error in fetchSyslogEntries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyslogEntries();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('render-syslog-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'render_syslog',
          filter: batchId ? `batch_id=eq.${batchId}` : undefined
        },
        (payload) => {
          console.log('New syslog entry:', payload);
          setSyslogEntries(prev => [payload.new as RenderSyslogEntry, ...prev.slice(0, maxEntries - 1)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId, maxEntries]);

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-xl p-4">
        <h5 className="text-white font-medium mb-3 flex items-center">
          <Server className="w-4 h-4 mr-2" />
          Render.com Syslog Stream
        </h5>
        <p className="text-white/60 text-sm">Loading syslog entries...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h5 className="text-white font-medium mb-3 flex items-center">
        <Server className="w-4 h-4 mr-2" />
        Render.com Syslog Stream
        {syslogEntries.length > 0 && (
          <Badge variant="outline" className="ml-2 text-white/80 border-white/30">
            {syslogEntries.length} entries
          </Badge>
        )}
      </h5>
      
      <ScrollArea className="h-64">
        {syslogEntries.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">
              {batchId ? 'No syslog entries for this batch yet' : 'No syslog entries received yet'}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Logs will appear here when Render.com sends data to the syslog endpoint
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {syslogEntries.map((entry) => {
              const severityInfo = getSeverityInfo(entry.severity);
              return (
                <div key={entry.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${severityInfo.color} text-white text-xs`}>
                        {severityInfo.icon} {severityInfo.label}
                      </Badge>
                      {entry.app_name && (
                        <Badge variant="outline" className="text-white/70 border-white/30 text-xs">
                          {entry.app_name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-white/50 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm mb-2">{entry.message}</p>
                  
                  {(entry.hostname || entry.proc_id) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.hostname && (
                        <span className="text-white/60">Host: {entry.hostname}</span>
                      )}
                      {entry.proc_id && (
                        <span className="text-white/60">PID: {entry.proc_id}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default RenderSyslogDisplay;
