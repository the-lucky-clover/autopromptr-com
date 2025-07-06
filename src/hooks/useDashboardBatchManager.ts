import { useEffect, useRef, useCallback } from 'react';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchCrud } from './useBatchCrud';
import { useBatchControl } from './useBatchControl';

/**
 * Centralized hook for managing all batch-related logic on the dashboard.
 * - Manages persistent state
 * - Integrates CRUD and control operations
 * - Guards against premature execution before full initialization
 */
export const useDashboardBatchManager = () => {
  const isInitializedRef = useRef(false);

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

  // Control logic (requires batch state)
  const {
    selectedBatchId,
    automationLoading,
    lastError,
    clearError,
    handleRunBatch: runBatch,
    handleStopBatch: stopBatch,
    handlePauseBatch: pauseBatch,
    handleRewindBatch: rewindBatch,
  } = useBatchControl({ batches, setBatches });

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
          return;
        }
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

    // CRUD ops
    handleCreateBatch: guard((data) => createBatch(data, setBatches)),
    handleUpdateBatch: guard((data) => updateBatch(data, setBatches)),
    handleDeleteBatch: guard((id) => deleteBatch(id, setBatches)),
    handleEditBatch,
    handleNewBatch,

    // Control ops
    handleRunBatch: guard((batch) => runBatch(batch)),
    handleStopBatch: guard((batch) => stopBatch(batch)),
    handlePauseBatch: guard((batch) => pauseBatch(batch)),
    handleRewindBatch: guard((batch) => rewindBatch(batch)),

    clearError,
  };
};
