
import { useBatchRunner } from './useBatchRunner';
import { useBatchActions } from './useBatchActions';

export const useBatchControl = () => {
  const {
    selectedBatchId,
    automationLoading,
    handleRunBatch
  } = useBatchRunner();

  const {
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  } = useBatchActions();

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  };
};
