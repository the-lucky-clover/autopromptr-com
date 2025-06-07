import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
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
  const { status: batchStatus, loading: automationLoading, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

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
    // Auto-detect platform from target URL
    const detectedPlatform = detectPlatformFromUrl(batchData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      platform: detectedPlatform
    };

    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);
    updateStats(updatedBatches);
    setShowModal(false);

    toast({
      title: "Batch created",
      description: `Batch created with auto-detected platform: ${platformName}`,
    });
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    // Auto-detect platform from target URL if it changed
    const detectedPlatform = detectPlatformFromUrl(updatedBatch.targetUrl);
    const batchWithPlatform = {
      ...updatedBatch,
      platform: detectedPlatform
    };

    const updatedBatches = batches.map(batch => 
      batch.id === batchWithPlatform.id ? batchWithPlatform : batch
    );
    setBatches(updatedBatches);
    updateStats(updatedBatches);
    setShowModal(false);
    setEditingBatch(null);

    const platformName = getPlatformName(detectedPlatform);
    toast({
      title: "Batch updated",
      description: `Batch updated with platform: ${platformName}`,
    });
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
    // Auto-detect platform if not set or if URL changed
    const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!detectedPlatform) {
      toast({
        title: "Cannot detect platform",
        description: "Unable to determine automation platform from the target URL. Please check the URL format.",
        variant: "destructive",
      });
      return;
    }

    // Update batch with detected platform
    const updatedBatch = { ...batch, platform: detectedPlatform };
    const updatedBatches = batches.map(b => 
      b.id === batch.id ? updatedBatch : b
    );
    setBatches(updatedBatches);

    setSelectedBatchId(batch.id);
    
    try {
      await runBatch(detectedPlatform, batch.settings);
      
      const finalUpdatedBatches = batches.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      );
      setBatches(finalUpdatedBatches);
      updateStats(finalUpdatedBatches);
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}" using ${platformName}.`,
      });
    } catch (err) {
      toast({
        title: "Failed to start batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleStopBatch = async (batch: Batch) => {
    try {
      await stopBatch();
      
      const updatedBatches = batches.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      );
      setBatches(updatedBatches);
      updateStats(updatedBatches);
      
      toast({
        title: "Batch stopped",
        description: `Automation stopped for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to stop batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  // Check if any batch is currently being processed
  const hasActiveBatch = batches.some(batch => batch.status === 'running');

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
              onStop={handleStopBatch}
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

      {/* System Logs Panel - only show diagnostics when there are active batches */}
      <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} />
    </div>
  );
};

export default DashboardBatchManager;
