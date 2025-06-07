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

    console.log('Starting batch run process for:', batch.id, 'with platform:', detectedPlatform);

    // Set the selected batch ID and loading state
    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Ensure batch has the correct platform and format before saving
      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('Ensuring batch exists in database before running...');
      console.log('Batch data being saved:', JSON.stringify(batchToRun, null, 2));
      
      // Force save the batch to ensure it exists in the database
      try {
        const saveResult = await saveBatchToDatabase(batchToRun);
        console.log('Pre-run database save result:', saveResult);
        
        if (!saveResult) {
          throw new Error('Failed to save batch to database before running');
        }
        
        // Add delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify the batch exists in the database
        const verificationResult = await verifyBatchInDatabase(batch.id);
        console.log('Batch verification result:', verificationResult);
        
        if (!verificationResult) {
          console.warn('Batch verification failed, but proceeding with automation');
        }
      } catch (saveError) {
        console.error('Error in pre-run batch save/verification:', saveError);
        throw new Error(`Failed to prepare batch for execution: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
      }
      
      console.log('Batch verification complete, proceeding with automation...');
      
      // Update batch status to running immediately
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      ));
      
      // Create a new AutoPromptr instance and run the batch
      const autoPromptr = new AutoPromptr();
      
      console.log('Starting automation with AutoPromptr...');
      const runResult = await autoPromptr.runBatch(batch.id, detectedPlatform, batch.settings || { delay: 5000, maxRetries: 3 });
      console.log('AutoPromptr run result:', runResult);
      
      toast({
        title: "Batch started successfully",
        description: `Automation started for "${batch.name}" using ${platformName}.`,
      });
    } catch (err) {
      console.error('Failed to start batch:', err);
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Failed to start batch",
        description: errorMessage,
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
