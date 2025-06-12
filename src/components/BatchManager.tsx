
import { useState, useEffect } from 'react';
import { useBatchOperations } from '@/hooks/useBatchOperations';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useBatchSync } from '@/hooks/useBatchSync';
import BatchForm from './BatchForm';
import BatchList from './BatchList';
import BatchManagerHeader from './BatchManagerHeader';
import AutomationErrorDisplay from './AutomationErrorDisplay';

const BatchManager = () => {
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const { platforms } = usePlatforms();
  const { triggerBatchSync } = useBatchSync();
  const {
    batches,
    setBatches,
    selectedBatchId,
    batchStatus,
    automationLoading,
    automationError,
    createBatch,
    deleteBatch,
    handleRunBatch,
    handleStopBatch,
    updatePrompt,
    deletePrompt,
    addPromptToBatch
  } = useBatchOperations();

  // Update batch status when automation status changes
  useEffect(() => {
    if (selectedBatchId && batchStatus) {
      setBatches(prev => prev.map(batch => {
        if (batch.id === selectedBatchId) {
          return {
            ...batch,
            status: batchStatus.status === 'processing' ? 'running' : 
                   batchStatus.status === 'completed' ? 'completed' :
                   batchStatus.status === 'failed' ? 'failed' :
                   batchStatus.status === 'stopped' ? 'failed' : 'pending'
          };
        }
        return batch;
      }));
    }
  }, [selectedBatchId, batchStatus, setBatches]);

  const handleCreateBatch = (formData: any) => {
    createBatch(formData);
    setShowNewBatchForm(false);
    // Trigger sync to update other components
    setTimeout(() => {
      triggerBatchSync();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <BatchManagerHeader onNewBatch={() => setShowNewBatchForm(true)} />

      <AutomationErrorDisplay error={automationError} />

      {showNewBatchForm && (
        <BatchForm
          onSubmit={handleCreateBatch}
          onCancel={() => setShowNewBatchForm(false)}
        />
      )}

      <BatchList
        batches={batches}
        platforms={platforms}
        batchStatus={batchStatus}
        selectedBatchId={selectedBatchId}
        automationLoading={automationLoading}
        onRun={handleRunBatch}
        onStop={handleStopBatch}
        onDelete={deleteBatch}
        onUpdatePrompt={updatePrompt}
        onDeletePrompt={deletePrompt}
        onAddPrompt={addPromptToBatch}
      />
    </div>
  );
};

export default BatchManager;
