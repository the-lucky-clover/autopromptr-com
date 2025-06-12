
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useBatchDatabase } from '@/hooks/useBatchDatabase';
import { Batch } from '@/types/batch';

export const useBatchStatusManager = () => {
  const { batches, setBatches } = usePersistentBatches();
  const { saveBatchToDatabase } = useBatchDatabase();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const markBatchAsFailed = async (batchId: string, errorMessage?: string) => {
    setIsUpdating(true);
    
    try {
      // Update local state
      setBatches(prev => prev.map(batch => {
        if (batch.id === batchId) {
          return {
            ...batch,
            status: 'failed' as const,
            errorMessage: errorMessage || 'Batch marked as failed manually'
          };
        }
        return batch;
      }));

      // Update database
      const batchToUpdate = batches.find(b => b.id === batchId);
      if (batchToUpdate) {
        const updatedBatch = {
          ...batchToUpdate,
          status: 'failed' as const,
          errorMessage: errorMessage || 'Batch marked as failed manually'
        };
        await saveBatchToDatabase(updatedBatch);
      }

      toast({
        title: "Batch marked as failed",
        description: "The batch status has been updated to failed.",
      });

    } catch (error) {
      console.error('Failed to mark batch as failed:', error);
      toast({
        title: "Failed to update batch",
        description: "Could not update the batch status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetBatchStatus = async (batchId: string) => {
    setIsUpdating(true);
    
    try {
      // Update local state
      setBatches(prev => prev.map(batch => {
        if (batch.id === batchId) {
          return {
            ...batch,
            status: 'pending' as const,
            errorMessage: undefined
          };
        }
        return batch;
      }));

      // Update database
      const batchToUpdate = batches.find(b => b.id === batchId);
      if (batchToUpdate) {
        const updatedBatch = {
          ...batchToUpdate,
          status: 'pending' as const,
          errorMessage: undefined
        };
        await saveBatchToDatabase(updatedBatch);
      }

      toast({
        title: "Batch reset",
        description: "The batch has been reset to pending status.",
      });

    } catch (error) {
      console.error('Failed to reset batch:', error);
      toast({
        title: "Failed to reset batch",
        description: "Could not reset the batch status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const detectAndFixFailedBatches = () => {
    const now = new Date();
    const stuckBatches = batches.filter(batch => {
      // Consider a batch stuck if it's been pending/running for more than 10 minutes
      const timeDiff = now.getTime() - new Date(batch.createdAt).getTime();
      const tenMinutes = 10 * 60 * 1000;
      
      return (batch.status === 'pending' || batch.status === 'running') && timeDiff > tenMinutes;
    });

    stuckBatches.forEach(batch => {
      markBatchAsFailed(batch.id, 'Batch timed out or failed to start');
    });

    if (stuckBatches.length > 0) {
      toast({
        title: "Cleaned up stuck batches",
        description: `Found and marked ${stuckBatches.length} stuck batches as failed.`,
      });
    }
  };

  return {
    markBatchAsFailed,
    resetBatchStatus,
    detectAndFixFailedBatches,
    isUpdating
  };
};
