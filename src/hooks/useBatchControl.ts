
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useBatchControl = () => {
  const { toast } = useToast();
  const { saveBatchToDatabase, verifyBatchInDatabase } = useBatchDatabase();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);

  const handleRunBatch = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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

    // Check if any batch is already running - only allow one batch at a time
    const runningBatch = await new Promise<Batch[]>((resolve) => {
      setBatches(prev => {
        const running = prev.filter(b => b.status === 'running');
        resolve(running);
        return prev;
      });
    });

    if (runningBatch.length > 0) {
      toast({
        title: "Batch already running",
        description: `Cannot start "${batch.name}" because "${runningBatch[0].name}" is already processing. Only one batch can run at a time.`,
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
      // Ensure batch has the correct platform and format before saving
      const batchToSave = {
        ...batch,
        platform: detectedPlatform,
        // Ensure createdAt is a proper Date object
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('Ensuring batch exists in database before running...');
      console.log('Batch to save:', batchToSave);
      
      try {
        await saveBatchToDatabase(batchToSave);
        console.log('Batch saved successfully');
      } catch (saveError) {
        console.error('Error saving batch:', saveError);
        // Continue anyway - the batch might already exist
      }
      
      // Try to verify the batch exists, but don't fail if it doesn't
      try {
        await verifyBatchInDatabase(batch.id);
        console.log('Batch verified in database');
      } catch (verifyError) {
        console.warn('Could not verify batch in database, but proceeding with automation:', verifyError);
      }
      
      console.log('Proceeding with automation...');
      
      // Update batch status to running immediately
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      ));
      
      // Create a new AutoPromptr instance and run the batch directly
      const autoPromptr = new AutoPromptr();
      await autoPromptr.runBatch(batch.id, detectedPlatform, batch.settings || { delay: 5000, maxRetries: 3 });
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}" using ${platformName}. Only this batch will be processed.`,
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
    selectedBatchId,
    automationLoading,
    handleRunBatch,
    handleStopBatch,
    handlePauseBatch,
    handleRewindBatch
  };
};
