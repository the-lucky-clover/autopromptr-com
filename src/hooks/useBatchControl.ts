
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { Batch } from '@/types/batch';

export const useBatchControl = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { loading: automationLoading, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

  const handleRunBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    if (!batch.platform) {
      toast({
        title: "Cannot detect platform",
        description: "Unable to determine automation platform from the batch. Please check the configuration.",
        variant: "destructive",
      });
      return;
    }

    // Check if any batch is already running
    const runningBatch = await new Promise<Batch | null>((resolve) => {
      setBatches(prev => {
        const running = prev.find(b => b.status === 'running');
        resolve(running || null);
        return prev;
      });
    });

    if (runningBatch) {
      toast({
        title: "Batch already running",
        description: `Cannot start "${batch.name}" because "${runningBatch.name}" is already processing. Only one batch can run at a time.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedBatchId(batch.id);
    
    try {
      // Pass the complete batch object to the automation service
      await runBatch(batch, batch.platform, batch.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' } : b
      ));
      
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

  const handleStopBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    try {
      await stopBatch();
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' } : b
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
    // Implement pause functionality if needed
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'paused' } : b
    ));
    
    toast({
      title: "Batch paused",
      description: `Batch "${batch.name}" has been paused.`,
    });
  };

  const handleRewindBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
    // Implement rewind functionality if needed
    setBatches(prev => prev.map(b => 
      b.id === batch.id ? { ...b, status: 'pending' } : b
    ));
    
    toast({
      title: "Batch rewound",
      description: `Batch "${batch.name}" has been reset to pending.`,
    });
  };

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  };
};
