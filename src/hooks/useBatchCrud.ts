
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useBatchCrud = () => {
  const { toast } = useToast();
  const { saveBatchToDatabase } = useBatchDatabase();
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const handleCreateBatch = async (
    batchData: Omit<Batch, 'id' | 'createdAt'>, 
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    const detectedPlatform = detectPlatformFromUrl(batchData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      platform: detectedPlatform
    };

    try {
      console.log('Creating new batch:', newBatch);
      
      // Save to database first and wait for completion
      await saveBatchToDatabase(newBatch);
      
      // Only update local state after successful database save
      setBatches(prev => [...prev, newBatch]);
      setShowModal(false);

      toast({
        title: "Batch created",
        description: `Batch created with auto-detected platform: ${platformName}`,
      });
    } catch (error) {
      console.error('Failed to create batch:', error);
      toast({
        title: "Failed to create batch",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleUpdateBatch = async (
    updatedBatch: Batch, 
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    const detectedPlatform = detectPlatformFromUrl(updatedBatch.targetUrl);
    const batchWithPlatform = {
      ...updatedBatch,
      platform: detectedPlatform
    };

    try {
      // Save to database first
      await saveBatchToDatabase(batchWithPlatform);
      
      // Then update local state
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
    } catch (error) {
      toast({
        title: "Failed to update batch",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleDeleteBatch = (batchId: string, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  return {
    showModal,
    setShowModal,
    editingBatch,
    setEditingBatch,
    handleCreateBatch,
    handleUpdateBatch,
    handleDeleteBatch,
    handleEditBatch,
    handleNewBatch
  };
};
