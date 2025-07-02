
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { useBatchAutomation } from '@/services/autoPromptr';
import { AutoPromptrError } from '@/services/autoPromptr';

interface BatchRunnerHook {
  running: boolean;
  completed: boolean;
  error: string | null;
  runBatch: (batch: Batch, platform: string) => Promise<void>;
  stopBatch: () => Promise<void>;
}

export function useBatchRunner(batchId?: string): BatchRunnerHook {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { runBatch: runAutoPromptrBatch, stopBatch: stopAutoPromptrBatch } = useBatchAutomation(batchId);

  const runBatch = useCallback(async (batch: Batch, platform: string) => {
    setRunning(true);
    setCompleted(false);
    setError(null);

    try {
      await runAutoPromptrBatch(batch, platform, {
        delay: 1000,
        maxRetries: 3
      });
      
      setCompleted(true);
      toast({
        title: "Batch completed",
        description: `Batch "${batch.name}" completed successfully.`,
      });
    } catch (err: any) {
      const errorMessage = err instanceof AutoPromptrError ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Batch failed",
        description: `Batch "${batch.name}" failed with error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  }, [runAutoPromptrBatch, toast]);

  const stopBatch = useCallback(async () => {
    if (!batchId) {
      setError('No batch ID provided');
      toast({
        title: "Error",
        description: "No batch ID was provided to stop.",
        variant: "destructive",
      });
      return;
    }

    try {
      await stopAutoPromptrBatch();
      toast({
        title: "Batch stopped",
        description: `Batch stopped successfully.`,
      });
    } catch (err: any) {
      const errorMessage = err instanceof AutoPromptrError ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error stopping batch",
        description: `Failed to stop batch: ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [batchId, stopAutoPromptrBatch, toast]);

  return {
    running,
    completed,
    error,
    runBatch,
    stopBatch,
  };
}
