
import { useEffect } from 'react';
import { useDashboardBatchManager } from '@/hooks/useDashboardBatchManager';
import BatchModal from './BatchModal';
import DashboardBatchList from './DashboardBatchList';
import DashboardEmptyState from './DashboardEmptyState';
import DashboardBatchHeader from './DashboardBatchHeader';
import SystemLogsPanel from './SystemLogsPanel';

interface DashboardBatchManagerProps {
  onStatsUpdate?: (stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  }) => void;
}

const DashboardBatchManager = ({ onStatsUpdate }: DashboardBatchManagerProps) => {
  const {
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
  } = useDashboardBatchManager();

  // Update stats whenever batches change
  useEffect(() => {
    if (onStatsUpdate) {
      const stats = {
        totalBatches: batches.length,
        activeBatches: batches.filter(b => b.status === 'running').length,
        completedBatches: batches.filter(b => b.status === 'completed').length,
        totalPrompts: batches.reduce((sum, batch) => sum + batch.prompts.length, 0)
      };
      onStatsUpdate(stats);
    }
  }, [batches, onStatsUpdate]);

  // Check if any batch is currently being processed
  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {batches.length === 0 ? (
          <DashboardEmptyState onNewBatch={handleNewBatch} />
        ) : (
          <>
            <DashboardBatchHeader onNewBatch={handleNewBatch} />
            <DashboardBatchList 
              batches={batches}
              onEdit={handleEditBatch}
              onDelete={handleDeleteBatch}
              onRun={handleRunBatch}
              onStop={handleStopBatch}
              onPause={handlePauseBatch}
              onRewind={handleRewindBatch}
              selectedBatchId={selectedBatchId}
              automationLoading={automationLoading}
            />
          </>
        )}

        <BatchModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingBatch(null);
          }}
          onSave={editingBatch ? handleUpdateBatch : handleCreateBatch}
          editingBatch={editingBatch}
        />
      </div>

      <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} />
    </div>
  );
};

export default DashboardBatchManager;
