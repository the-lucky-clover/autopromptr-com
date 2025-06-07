
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

export const useDashboardBatchManager = () => {
  // All hooks must be called in the same order every time
  const { batches, setBatches } = usePersistentBatches();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);

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

    console.log('Running batch:', batch.id, 'with platform:', detectedPlatform);
    console.log('Batch data:', batch);

    // Set the selected batch ID and loading state
    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to running immediately
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      ));
      
      // Create a new AutoPromptr instance and run the batch directly
      const autoPromptr = new AutoPromptr();
      await autoPromptr.runBatch(batch.id, detectedPlatform, batch.settings || { delay: 5000, maxRetries: 3 });
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}" using ${platformName}.`,
      });
    } catch (err) {
      console.error('Failed to start batch:', err);
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      toast({
        title: "Failed to start batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleStopBatch = async (batch: Batch) => {
    try {
      const autoPromptr = new AutoPromptr();
      await autoPromptr.stopBatch(batch.id);
      
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

  const handlePauseBatch = async (batch: Batch) => {
    try {
      // For now, we'll use the stop functionality but set status to paused
      const autoPromptr = new AutoPromptr();
      await autoPromptr.stopBatch(batch.id);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'paused' as const } : b
      ));
      
      toast({
        title: "Batch paused",
        description: `Automation paused for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to pause batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleRewindBatch = (batch: Batch) => {
    // Reset batch to pending status to allow restart
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'pending' as const } : b
    ));
    
    toast({
      title: "Batch rewound",
      description: `Batch "${batch.name}" has been reset to pending status.`,
    });
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
    handlePauseBatch,
    handleRewindBatch,
    handleNewBatch
  };
};
