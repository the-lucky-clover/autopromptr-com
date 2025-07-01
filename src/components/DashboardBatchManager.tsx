import { useEffect } from 'react';
import { useDashboardBatchManager } from '@/hooks/useDashboardBatchManager';
import { useBatchStatusManager } from '@/hooks/useBatchStatusManager';
import { useBatchSync } from '@/hooks/useBatchSync';
import BatchModal from './BatchModal';
import DashboardBatchList from './DashboardBatchList';
import DashboardEmptyState from './DashboardEmptyState';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardBatchManagerProps {
  onStatsUpdate?: (stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  }) => void;
  onBatchesUpdate?: (batches: any[]) => void;
  isCompact?: boolean;
  onNewBatchRequest?: () => void;
}

const DashboardBatchManager = ({ 
  onStatsUpdate, 
  onBatchesUpdate, 
  isCompact = false,
  onNewBatchRequest 
}: DashboardBatchManagerProps) => {
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

  const { detectAndFixFailedBatches } = useBatchStatusManager();
  const { triggerBatchSync } = useBatchSync();

  // Listen for new batch requests from control bar
  useEffect(() => {
    if (onNewBatchRequest) {
      const handleExternalNewBatch = () => {
        handleNewBatch();
      };
      
      window.dashboardNewBatchHandler = handleExternalNewBatch;
    }
    
    return () => {
      delete window.dashboardNewBatchHandler;
    };
  }, [handleNewBatch, onNewBatchRequest]);

  // Manual refresh function
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    triggerBatchSync();
  };

  // Simple delete handler - removed extra sync calls
  const handleEnhancedDeleteBatch = (batchId: string) => {
    console.log('Dashboard deleting batch:', batchId);
    handleDeleteBatch(batchId);
  };

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

  // Update batches for parent component
  useEffect(() => {
    if (onBatchesUpdate) {
      onBatchesUpdate(batches);
    }
  }, [batches, onBatchesUpdate]);

  // Check for stuck/failed batches on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const stuckBatches = batches.filter(batch => {
        const now = new Date();
        const timeDiff = now.getTime() - new Date(batch.createdAt).getTime();
        const tenMinutes = 10 * 60 * 1000;
        return (batch.status === 'pending' || batch.status === 'running') && timeDiff > tenMinutes;
      });

      if (stuckBatches.length > 0) {
        console.log('Found stuck batches:', stuckBatches.map(b => b.name));
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [batches]);

  const stuckBatchCount = batches.filter(batch => {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(batch.createdAt).getTime();
    const tenMinutes = 10 * 60 * 1000;
    return (batch.status === 'pending' || batch.status === 'running') && timeDiff > tenMinutes;
  }).length;

  return (
    <div className={`space-y-6 ${isCompact ? 'space-y-4' : ''}`}>
      <div className={`space-y-6 ${isCompact ? 'space-y-4' : ''}`}>
        {batches.length === 0 ? (
          <DashboardEmptyState onNewBatch={handleNewBatch} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl btn-with-shadow px-4 py-2"
                  title="Refresh batch list"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {stuckBatchCount > 0 && (
                <Button
                  onClick={detectAndFixFailedBatches}
                  variant="outline"
                  size="sm"
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30 btn-with-shadow px-4 py-2"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Fix {stuckBatchCount} Stuck Batch{stuckBatchCount > 1 ? 'es' : ''}
                </Button>
              )}
            </div>
            
            <DashboardBatchList 
              batches={batches}
              onEdit={handleEditBatch}
              onDelete={handleEnhancedDeleteBatch}
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
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingBatch(null);
          }}
          onSave={editingBatch ? handleUpdateBatch : handleCreateBatch}
          batch={editingBatch}
        />
      </div>
    </div>
  );
};

export default DashboardBatchManager;
