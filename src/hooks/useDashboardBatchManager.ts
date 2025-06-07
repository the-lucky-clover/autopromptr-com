
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchCrud } from './useBatchCrud';
import { useBatchControl } from './useBatchControl';

export const useDashboardBatchManager = () => {
  const { batches, setBatches } = usePersistentBatches();
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
  } = useBatchCrud();

  const {
    selectedBatchId,
    automationLoading,
    handleRunBatch: runBatch,
    handleStopBatch: stopBatch,
    handlePauseBatch: pauseBatch,
    handleRewindBatch: rewindBatch
  } = useBatchControl();

  // Wrapper functions to pass setBatches to the handlers
  const handleCreateBatch = (batchData: Parameters<typeof createBatch>[0]) => {
    return createBatch(batchData, setBatches);
  };

  const handleUpdateBatch = (updatedBatch: Parameters<typeof updateBatch>[0]) => {
    return updateBatch(updatedBatch, setBatches);
  };

  const handleDeleteBatch = (batchId: string) => {
    return deleteBatch(batchId, setBatches);
  };

  const handleRunBatch = (batch: Parameters<typeof runBatch>[0]) => {
    return runBatch(batch, setBatches);
  };

  const handleStopBatch = (batch: Parameters<typeof stopBatch>[0]) => {
    return stopBatch(batch, setBatches);
  };

  const handlePauseBatch = (batch: Parameters<typeof pauseBatch>[0]) => {
    return pauseBatch(batch, setBatches);
  };

  const handleRewindBatch = (batch: Parameters<typeof rewindBatch>[0]) => {
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
