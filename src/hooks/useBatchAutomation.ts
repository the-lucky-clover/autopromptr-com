
import { useState, useEffect } from 'react';
import { AutoPromptr } from '@/services/autoPromptr';
import { BatchStatus, Batch } from '@/types/batch';

// React Hook for batch automation
export function useBatchAutomation(batchId?: string) {
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPromptr] = useState(new AutoPromptr());

  // Poll for status updates
  useEffect(() => {
    if (!batchId) return;

    const pollStatus = async () => {
      try {
        const statusData = await autoPromptr.getBatchStatus(batchId);
        
        // Convert the simple response to BatchStatus format
        const batchStatus: BatchStatus = {
          status: statusData.status === 'completed' ? 'completed' : 
                 statusData.status === 'stopped' ? 'stopped' : 
                 statusData.status === 'failed' ? 'failed' : 'processing',
          platform: 'web',
          progress: {
            completed: statusData.status === 'completed' ? 1 : 0,
            total: 1,
            percentage: statusData.status === 'completed' ? 100 : 0,
            failed: statusData.status === 'failed' ? 1 : 0,
            processing: statusData.status === 'processing' ? 1 : 0,
            pending: statusData.status === 'pending' ? 1 : 0
          }
        };
        
        setStatus(batchStatus);
        
        // Stop polling if batch is completed or failed
        if (['completed', 'failed', 'stopped'].includes(batchStatus.status)) {
          return;
        }
        
        // Continue polling every 5 seconds
        setTimeout(pollStatus, 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    pollStatus();
  }, [batchId, autoPromptr]);

  const runBatch = async (batch: Batch, platform: string, options?: { waitForIdle?: boolean; maxRetries?: number }) => {
    if (!batch || !batch.id) throw new Error('No batch provided');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await autoPromptr.runBatch(batch, platform, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopBatch = async () => {
    if (!batchId) throw new Error('No batch ID provided');
    
    try {
      await autoPromptr.stopBatch(batchId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    runBatch,
    stopBatch,
    autoPromptr
  };
}
