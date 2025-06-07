
import { useBatchRunner } from './useBatchRunner';
import { useBatchActions } from './useBatchActions';

export const useBatchControl = () => {
  // Initialize hooks in consistent order - both hooks must always be called
  const batchRunner = useBatchRunner();
  const batchActions = useBatchActions();

  const {
    selectedBatchId,
    automationLoading,
    handleRunBatch
  } = batchRunner;

  const {
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  } = batchActions;

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  };
};
