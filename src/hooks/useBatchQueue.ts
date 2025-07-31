
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';

interface QueuedBatch {
  batch: Batch;
  priority: number;
  timestamp: Date;
  retryCount: number;
}

interface BatchQueueStatus {
  isProcessing: boolean;
  currentBatch: Batch | null;
  queueLength: number;
  estimatedWaitTime: number;
}

export const useBatchQueue = () => {
  const [queue, setQueue] = useState<QueuedBatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const { toast } = useToast();

  // Add batch to queue with priority
  const enqueueBatch = (batch: Batch, priority: number = 0): boolean => {
    try {
      const queuedBatch: QueuedBatch = {
        batch,
        priority,
        timestamp: new Date(),
        retryCount: 0
      };

      setQueue(prev => {
        // Check if batch is already in queue
        const existingIndex = prev.findIndex(qb => qb.batch.id === batch.id);
        if (existingIndex !== -1) {
          console.log(`Batch ${batch.id} already in queue, updating priority`);
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], priority };
          return updated.sort((a, b) => b.priority - a.priority);
        }

        // Add new batch and sort by priority
        const newQueue = [...prev, queuedBatch];
        return newQueue.sort((a, b) => b.priority - a.priority);
      });

      console.log(`Batch ${batch.id} added to queue with priority ${priority}`);
      
      toast({
        title: "Batch queued",
        description: `"${batch.name}" has been added to the processing queue.`,
      });

      return true;
    } catch (error) {
      console.error('Failed to enqueue batch:', error);
      
      toast({
        title: "Queue error",
        description: "Failed to add batch to processing queue.",
        variant: "destructive",
      });

      return false;
    }
  };

  // Remove batch from queue
  const dequeueBatch = (batchId: string): boolean => {
    try {
      setQueue(prev => prev.filter(qb => qb.batch.id !== batchId));
      console.log(`Batch ${batchId} removed from queue`);
      return true;
    } catch (error) {
      console.error('Failed to dequeue batch:', error);
      return false;
    }
  };

  // Get next batch from queue
  const getNextBatch = (): QueuedBatch | null => {
    const sortedQueue = queue.sort((a, b) => {
      // Sort by priority first, then by timestamp
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    return sortedQueue[0] || null;
  };

  // Process queue automatically
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing || queue.length === 0) {
        return;
      }

      const nextQueuedBatch = getNextBatch();
      if (!nextQueuedBatch) {
        return;
      }

      console.log(`Starting to process batch from queue: ${nextQueuedBatch.batch.id}`);
      setIsProcessing(true);
      setCurrentBatch(nextQueuedBatch.batch);

      try {
        // Remove batch from queue since we're processing it
        dequeueBatch(nextQueuedBatch.batch.id);

        // Call actual batch processing logic
        console.log(`Processing batch: ${nextQueuedBatch.batch.name}`);
        
        toast({
          title: "Batch processing started",
          description: `Started processing "${nextQueuedBatch.batch.name}".`,
        });

      } catch (error) {
        console.error('Queue processing error:', error);
        
        // Handle retry logic
        if (nextQueuedBatch.retryCount < 3) {
          const retryBatch = {
            ...nextQueuedBatch,
            retryCount: nextQueuedBatch.retryCount + 1,
            priority: Math.max(0, nextQueuedBatch.priority - 1) // Lower priority on retry
          };
          
          setQueue(prev => [...prev, retryBatch]);
          
          toast({
            title: "Batch retry queued",
            description: `"${nextQueuedBatch.batch.name}" will be retried (attempt ${retryBatch.retryCount + 1}/3).`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Batch failed",
            description: `"${nextQueuedBatch.batch.name}" failed after 3 attempts.`,
            variant: "destructive",
          });
        }
      } finally {
        setIsProcessing(false);
        setCurrentBatch(null);
      }
    };

    // Process queue every 5 seconds
    const interval = setInterval(processQueue, 5000);
    
    // Also try to process immediately if queue is not empty
    if (queue.length > 0 && !isProcessing) {
      processQueue();
    }

    return () => clearInterval(interval);
  }, [queue, isProcessing]);

  // Get queue status
  const getQueueStatus = (): BatchQueueStatus => {
    const estimatedWaitTime = queue.length * 30; // Estimate 30 seconds per batch
    
    return {
      isProcessing,
      currentBatch,
      queueLength: queue.length,
      estimatedWaitTime
    };
  };

  // Clear entire queue
  const clearQueue = (): void => {
    setQueue([]);
    console.log('Batch queue cleared');
    
    toast({
      title: "Queue cleared",
      description: "All batches have been removed from the processing queue.",
    });
  };

  return {
    enqueueBatch,
    dequeueBatch,
    getQueueStatus,
    clearQueue,
    queue: queue.map(qb => qb.batch), // Return just the batches for external use
    isProcessing,
    currentBatch
  };
};
