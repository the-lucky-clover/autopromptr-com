
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { Batch } from '@/types/batch';
import BatchModal from './BatchModal';
import DashboardBatchList from './DashboardBatchList';
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
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { status: batchStatus, loading: automationLoading, runBatch } = useBatchAutomation(selectedBatchId || undefined);

  // Update stats whenever batches change
  const updateStats = (updatedBatches: Batch[]) => {
    if (onStatsUpdate) {
      const stats = {
        totalBatches: updatedBatches.length,
        activeBatches: updatedBatches.filter(b => b.status === 'running').length,
        completedBatches: updatedBatches.filter(b => b.status === 'completed').length,
        totalPrompts: updatedBatches.reduce((sum, batch) => sum + batch.prompts.length, 0)
      };
      onStatsUpdate(stats);
    }
  };

  const handleCreateBatch = (batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);
    updateStats(updatedBatches);
    setShowModal(false);
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    const updatedBatches = batches.map(batch => 
      batch.id === updatedBatch.id ? updatedBatch : batch
    );
    setBatches(updatedBatches);
    updateStats(updatedBatches);
    setShowModal(false);
    setEditingBatch(null);
  };

  const handleDeleteBatch = (batchId: string) => {
    const updatedBatches = batches.filter(batch => batch.id !== batchId);
    setBatches(updatedBatches);
    updateStats(updatedBatches);
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleRunBatch = async (batch: Batch) => {
    if (!batch.platform) {
      toast({
        title: "No platform selected",
        description: "Please edit the batch and select an automation platform.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBatchId(batch.id);
    
    try {
      await runBatch(batch.platform, batch.settings);
      
      const updatedBatches = batches.map(b => 
        b.id === batch.id ? { ...b, status: 'running' } : b
      );
      setBatches(updatedBatches);
      updateStats(updatedBatches);
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to start batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/70 mb-4">No batches created yet</p>
            <Button 
              onClick={handleNewBatch}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Batch
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Your Batches</h3>
              <Button 
                onClick={handleNewBatch}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Button>
            </div>
            <DashboardBatchList 
              batches={batches}
              onEdit={handleEditBatch}
              onDelete={handleDeleteBatch}
              onRun={handleRunBatch}
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

      {/* System Logs Panel */}
      <SystemLogsPanel batches={batches} />
    </div>
  );
};

export default DashboardBatchManager;
