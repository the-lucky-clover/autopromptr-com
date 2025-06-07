
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';
import { useBatchDatabase } from './useBatchDatabase';

export const useBatchActions = () => {
  // Always call hooks at the top level, never conditionally
  const { toast } = useToast();
  const { saveBatchToDatabase } = useBatchDatabase();

  const handleStopBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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

  const handlePauseBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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

  const handleRewindBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    try {
      // Reset batch to pending status to allow restart
      const rewindBatch = { ...batch, status: 'pending' as const };
      
      // Save to database
      await saveBatchToDatabase(rewindBatch);
      
      // Update local state
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? rewindBatch : b
      ));
      
      toast({
        title: "Batch rewound",
        description: `Batch "${batch.name}" has been reset to pending status.`,
      });
    } catch (error) {
      toast({
        title: "Failed to rewind batch",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  return {
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  };
};
