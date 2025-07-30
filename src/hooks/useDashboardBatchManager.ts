
import { useEffect, useRef, useCallback } from 'react';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchCrud } from './useBatchCrud';
import { useBatchControl } from './useBatchControl';
import { useToast } from '@/hooks/use-toast';

/**
 * Centralized hook for managing all batch-related logic on the dashboard.
 * - Manages persistent state
 * - Integrates CRUD and control operations
 * - Guards against premature execution before full initialization
 */
export const useDashboardBatchManager = () => {
  const isInitializedRef = useRef(false);
  const { toast } = useToast();

  // Persistent batches from localStorage or DB
  const { batches, setBatches } = usePersistentBatches();

  // CRUD ops
  const {
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    handleCreateBatch: createBatch,
    handleUpdateBatch: updateBatch,
    handleDeleteBatch: deleteBatch,
    handleEditBatch,
    handleNewBatch,
  } = useBatchCrud();

  // Control logic (requires batch state) - using object destructuring syntax
  const {
    selectedBatchId,
    automationLoading,
    lastError,
    clearError,
    handleRunBatch: runBatch,
    handleStopBatch: stopBatch,
    handlePauseBatch: pauseBatch,
    handleRewindBatch: rewindBatch,
  } = useBatchControl(batches, setBatches);

  // Initialization
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ Dashboard batch manager initialized');
    }
  }, []);

  /**
   * Wraps a function and ensures it doesn't run until initialization is complete.
   */
  const guard = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T =>
      ((...args: Parameters<T>) => {
        if (!isInitializedRef.current) {
          console.warn('[BatchManager] Operation skipped: not initialized yet');
          toast({
            title: 'System Initializing',
            description: 'Dashboard is still initializing. Please wait a moment and try again.',
            variant: 'default'
          });
          return;
        }
        console.log('[BatchManager] ✅ Operation proceeding - system initialized');
        return fn(...args);
      }) as T,
    []
  );

  return {
    // Batch state
    batches,
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    selectedBatchId,
    automationLoading,
    lastError,

    // CRUD ops - properly wrapped with setBatches
    handleCreateBatch: guard((data: any) => createBatch(data, setBatches)),
    handleUpdateBatch: guard((data: any) => updateBatch(data, setBatches)),
    handleDeleteBatch: guard((id: string) => deleteBatch(id, setBatches)),
    handleEditBatch,
    handleNewBatch,

    // Control ops - these already receive batches and setBatches from useBatchControl
    handleRunBatch: guard(runBatch),
    handleStopBatch: guard(stopBatch),
    handlePauseBatch: guard(pauseBatch),
    handleRewindBatch: guard(rewindBatch),

    clearError,
  };
};
