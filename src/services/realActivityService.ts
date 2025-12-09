
import { cloudflare } from '@/integrations/cloudflare/client';

export interface RealActivityItem {
  id: string;
  type: 'batch_created' | 'batch_completed' | 'batch_failed' | 'batch_started' | 'batch_paused' | 'system_event';
  message: string;
  timestamp: Date;
  batchName?: string;
  metadata?: any;
}

export const fetchRecentActivity = async (limit: number = 10): Promise<RealActivityItem[]> => {
  try {
    const activities: RealActivityItem[] = [];
    
    // Fetch recent batches
    const { data: batches } = await cloudflare
      .from('batches')
      .select('id, name, status, created_at, started_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (batches) {
      batches.forEach(batch => {
        if (batch.created_at) {
          activities.push({
            id: `batch_created_${batch.id}`,
            type: 'batch_created',
            message: `New batch "${batch.name}" created`,
            timestamp: new Date(batch.created_at),
            batchName: batch.name
          });
        }
        
        if (batch.started_at) {
          activities.push({
            id: `batch_started_${batch.id}`,
            type: 'batch_started',
            message: `Batch "${batch.name}" started processing`,
            timestamp: new Date(batch.started_at),
            batchName: batch.name
          });
        }
        
        if (batch.completed_at) {
          activities.push({
            id: `batch_completed_${batch.id}`,
            type: batch.status === 'failed' ? 'batch_failed' : 'batch_completed',
            message: `Batch "${batch.name}" ${batch.status === 'failed' ? 'failed' : 'completed successfully'}`,
            timestamp: new Date(batch.completed_at),
            batchName: batch.name
          });
        }
      });
    }

    // Fetch automation logs
    const { data: logs } = await cloudflare
      .from('automation_logs')
      .select('id, message, timestamp, level, metadata')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (logs) {
      logs.forEach(log => {
        activities.push({
          id: `log_${log.id}`,
          type: 'system_event',
          message: log.message,
          timestamp: new Date(log.timestamp),
          metadata: log.metadata
        });
      });
    }

    // Sort by timestamp and return limited results
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error fetching real activity:', error);
    return [];
  }
};

// Cloudflare doesn't have realtime subscriptions like Supabase
// Use polling instead for activity updates
export const subscribeToActivityUpdates = (callback: (activities: RealActivityItem[]) => void) => {
  // Initial fetch
  fetchRecentActivity().then(callback);
  
  // Poll every 10 seconds for updates
  const pollInterval = setInterval(() => {
    fetchRecentActivity().then(callback);
  }, 10000);

  // Return cleanup function
  return () => {
    clearInterval(pollInterval);
  };
};
