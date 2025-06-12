
import { useEffect, useCallback } from 'react';
import { Batch } from '@/types/batch';

const BATCH_SYNC_EVENT = 'autopromptr_batch_sync';

export const useBatchSync = () => {
  const triggerBatchSync = useCallback(() => {
    console.log('Triggering batch sync across components...');
    window.dispatchEvent(new CustomEvent(BATCH_SYNC_EVENT));
  }, []);

  const subscribeToBatchSync = useCallback((callback: () => void) => {
    const handleSync = () => {
      console.log('Received batch sync event');
      callback();
    };

    window.addEventListener(BATCH_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(BATCH_SYNC_EVENT, handleSync);
  }, []);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'autopromptr_batches' && e.newValue !== e.oldValue) {
        console.log('Detected localStorage change, triggering sync');
        triggerBatchSync();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [triggerBatchSync]);

  return {
    triggerBatchSync,
    subscribeToBatchSync
  };
};
