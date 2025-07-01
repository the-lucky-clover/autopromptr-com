
import { useCallback, useRef } from 'react';

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
    }, 200); // Increased debounce
  }, []);

  const subscribeToBatchSync = useCallback((callback: () => void) => {
    const handleSync = () => {
      console.log('Received batch sync event');
      callback();
    };

    window.addEventListener(BATCH_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(BATCH_SYNC_EVENT, handleSync);
  }, []);

  // Cleanup debounce on unmount
  const cleanup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    triggerBatchSync,
    subscribeToBatchSync,
    cleanup
  };
};
