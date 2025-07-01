
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchCrud } from './useBatchCrud';
import { useBatchControl } from './useBatchControl';
import { useEffect, useRef } from 'react';

export const useDashboardBatchManager = () => {
  const isInitializedRef = useRef(false);
  
  // Always call hooks in the same order at the top level
  const { batches, setBatches } = usePersistentBatches();
  const batchCrud = useBatchCrud();
  const batchControl = useBatchControl();

  // Prevent multiple initializations
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('Dashboard batch manager initialized');
    }
  }, []);

  // Destructure after all hooks are called
  const {
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    handleCreateBatch: createBatch,
    handleUpdateBatch: updateBatch,
    handleDeleteBatch: deleteBatch,
    handleEditBatch,
    handleNewBatch
  } = batchCrud;

  const {
    selectedBatchId,
    automationLoading,
    lastError,
    clearError,
    handleRunBatch: runBatch,
    handleStopBatch: stopBatch,
    handlePauseBatch: pauseBatch,
    handleRewindBatch: rewindBatch
  } = batchControl;

  // Wrapper functions to pass setBatches to the handlers with guards
  const handleCreateBatch = (batchData: Parameters<typeof createBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return createBatch(batchData, setBatches);
  };

  const handleUpdateBatch = (updatedBatch: Parameters<typeof updateBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return updateBatch(updatedBatch, setBatches);
  };

  const handleDeleteBatch = (batchId: string) => {
    if (!isInitializedRef.current) return;
    return deleteBatch(batchId, setBatches);
  };

  const handleRunBatch = (batch: Parameters<typeof runBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return runBatch(batch, setBatches);
  };

  const handleStopBatch = (batch: Parameters<typeof stopBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return stopBatch(batch, setBatches);
  };

  const handlePauseBatch = (batch: Parameters<typeof pauseBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return pauseBatch(batch, setBatches);
  };

  const handleRewindBatch = (batch: Parameters<typeof rewindBatch>[0]) => {
    if (!isInitializedRef.current) return;
    return rewindBatch(batch, setBatches);
  };

  return {
    batches,
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    selectedBatchId,
    automationLoading,
    lastError,
    clearError,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    handleEditBatch,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch,
    handleNewBatch
  };
};
