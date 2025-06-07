import { useState, useEffect } from 'react';
import { AutoPromptr } from '@/services/autoPromptr';
import { BatchStatus } from '@/types/batch';

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
        setStatus(statusData);
        
        // Stop polling if batch is completed or failed
        if (['completed', 'failed', 'stopped'].includes(statusData.status)) {
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

  const runBatch = async (platform: string, options?: { delay?: number; maxRetries?: number }) => {
    if (!batchId) throw new Error('No batch ID provided');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await autoPromptr.runBatch(batchId, platform, options);
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
