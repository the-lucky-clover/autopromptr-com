import { useEffect, useRef } from 'react';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchCrud } from './useBatchCrud';
import { useBatchControl } from './useBatchControl';

/**
 * Hook for managing batch operations on the dashboard
 */
export const useDashboardBatchManager = () => {
  const isInitializedRef = useRef(false);

  // Persistent batch state
  const { batches, setBatches } = usePersistentBatches();

  // Batch CRUD operations
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

  // Batch control operations (pass required state to new API)
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

  // Initialization logic
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ Dashboard batch manager initialized');
    }
  }, []);

  // Wrap all mutating operations with initialization guard
  const guard = <T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (!isInitializedRef.current) return;
      return fn(...args);
    };
  };

  return {
    // State
    batches,
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    selectedBatchId,
    automationLoading,
    lastError,

    // CRUD
    handleCreateBatch: guard((data) => createBatch(data, setBatches)),
    handleUpdateBatch: guard((data) => updateBatch(data, setBatches)),
    handleDeleteBatch: guard((id) => deleteBatch(id, setBatches)),
    handleEditBatch,
    handleNewBatch,

    // Control
    handleRunBatch: guard((batch) => runBatch(batch)),
    handleStopBatch: guard((batch) => stopBatch(batch)),
    handlePauseBatch: guard((batch) => pauseBatch(batch)),
    handleRewindBatch: guard((batch) => rewindBatch(batch)),
    clearError,
  };
};
