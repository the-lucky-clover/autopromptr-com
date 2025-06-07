
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

export const useDashboardBatchManager = () => {
  const { batches, setBatches } = usePersistentBatches();
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { status: batchStatus, loading: automationLoading, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

  const handleCreateBatch = (batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    const detectedPlatform = detectPlatformFromUrl(batchData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      platform: detectedPlatform
    };

    setBatches(prev => [...prev, newBatch]);
    setShowModal(false);

    toast({
      title: "Batch created",
      description: `Batch created with auto-detected platform: ${platformName}`,
    });
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    const detectedPlatform = detectPlatformFromUrl(updatedBatch.targetUrl);
    const batchWithPlatform = {
      ...updatedBatch,
      platform: detectedPlatform
    };

    setBatches(prev => prev.map(batch => 
      batch.id === batchWithPlatform.id ? batchWithPlatform : batch
    ));
    setShowModal(false);
    setEditingBatch(null);

    const platformName = getPlatformName(detectedPlatform);
    toast({
      title: "Batch updated",
      description: `Batch updated with platform: ${platformName}`,
    });
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleRunBatch = async (batch: Batch) => {
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

    const updatedBatch = { ...batch, platform: detectedPlatform };
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? updatedBatch : b
    ));

    // Set the selected batch ID FIRST, then run the batch
    setSelectedBatchId(batch.id);
    
    try {
      // Create a new AutoPromptr instance specifically for this batch
      const { AutoPromptr } = await import('@/services/autoPromptr');
      const autoPromptr = new AutoPromptr();
      
      await autoPromptr.runBatch(batch.id, detectedPlatform, batch.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      ));
      
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
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      
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
    handleNewBatch
  };
};
