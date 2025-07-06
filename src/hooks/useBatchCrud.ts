import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useBatchCrud = () => {
  const { toast } = useToast();
  const { saveBatchToDatabase, deleteBatchFromDatabase } = useBatchDatabase();

  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Loading states for CRUD operations
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Error state for any operation
  const [error, setError] = useState<string | null>(null);

  const handleCreateBatch = async (
    batchData: Omit<Batch, 'id' | 'createdAt'>,
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    setLoadingCreate(true);
    setError(null);

    const detectedPlatform = detectPlatformFromUrl(batchData.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      platform: detectedPlatform,
      status: 'pending',
      settings: {
        waitForIdle: batchData.settings?.waitForIdle ?? true,
        maxRetries: batchData.settings?.maxRetries ?? 0,
      },
    };

    try {
      const saveResult = await saveBatchToDatabase(newBatch);
      if (!saveResult) throw new Error('Failed to save batch to database');

      // Small delay to ensure DB consistency
      await new Promise((resolve) => setTimeout(resolve, 100));

      setBatches((prev) => [...prev, newBatch]);
      setShowModal(false);
      setEditingBatch(null);

      toast({
        title: 'Batch created successfully',
        description: `Batch "${newBatch.name}" created with platform: ${platformName} and idle detection enabled`,
      });
    } catch (err) {
      console.error('Failed to create batch:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: 'Failed to create batch',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleUpdateBatch = async (
    updatedBatch: Batch,
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    setLoadingUpdate(true);
    setError(null);

    const detectedPlatform = detectPlatformFromUrl(updatedBatch.targetUrl);
    const batchWithPlatform = {
      ...updatedBatch,
      platform: detectedPlatform,
    };

    try {
      const saveResult = await saveBatchToDatabase(batchWithPlatform);
      if (!saveResult) throw new Error('Failed to update batch in database');

      setBatches((prev) =>
        prev.map((batch) => (batch.id === batchWithPlatform.id ? batchWithPlatform : batch))
      );

      setShowModal(false);
      setEditingBatch(null);

      const platformName = getPlatformName(detectedPlatform);
      toast({
        title: 'Batch updated',
        description: `Batch updated with platform: ${platformName}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: 'Failed to update batch',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDeleteBatch = async (
    batchId: string,
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    setLoadingDelete(true);
    setError(null);

    try {
      const deleted = await deleteBatchFromDatabase(batchId);
      if (!deleted) throw new Error('Failed to delete batch from database');

      setBatches((prev) => prev.filter((batch) => batch.id !== batchId));

      toast({
        title: 'Batch deleted',
        description: 'Batch has been removed successfully.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast({
        title: 'Failed to delete batch',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingDelete(false);
    }
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
    handleNewBatch,
    loadingCreate,
    loadingUpdate,
    loadingDelete,
    error,
  };
};
