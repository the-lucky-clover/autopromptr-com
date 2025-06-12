
import { useEffect, useCallback, useRef } from 'react';

const BATCH_SYNC_EVENT = 'autopromptr_batch_sync';

export const useBatchSync = () => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBatchSync = useCallback(() => {
    // Debounce sync triggers to prevent rapid-fire events
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      console.log('Triggering batch sync across components...');
      window.dispatchEvent(new CustomEvent(BATCH_SYNC_EVENT));
    }, 100); // 100ms debounce
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    triggerBatchSync,
    subscribeToBatchSync
  };
};
