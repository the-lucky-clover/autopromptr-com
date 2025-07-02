
import { useState } from 'react';
import { AutoPromptr } from './client';
import { AutoPromptprError } from './errors';

// Optimized React Hook with reduced polling
export function useBatchAutomation(batchId?: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPromptr] = useState(new AutoPromptr());

  const runBatch = async (batch: any, platform: string, options?: { delay?: number; maxRetries?: number }) => {
    if (!batch || !batch.id) throw new AutoPromptprError('No batch provided', 'NO_BATCH_PROVIDED');
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running batch with optimized backend:', batch.id);
      const result = await autoPromptr.runBatch(batch, platform, options);
      console.log('✅ Batch completed successfully');
      setStatus(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof AutoPromptprError ? err.message : 'Unknown error';
      console.error('Batch run error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopBatch = async () => {
    if (!batchId) throw new AutoPromptprError('No batch ID provided', 'NO_BATCH_ID');
    
    try {
      await autoPromptr.stopBatch(batchId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof AutoPromptprError ? err.message : 'Unknown error';
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
