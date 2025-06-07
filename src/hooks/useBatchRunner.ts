
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useBatchRunner = () => {
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

    // Set the selected batch ID and loading state immediately
    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to show it's starting up
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'pending' as const } : b
      ));

      // Ensure batch has the correct platform and format before saving
      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('Ensuring batch exists in database before running...');
      console.log('Batch data being saved:', JSON.stringify(batchToRun, null, 2));
      
      // Force save the batch to ensure it exists in the database with proper retry logic
      let saveAttempts = 0;
      const maxSaveAttempts = 3;
      let saveResult = false;
      
      while (!saveResult && saveAttempts < maxSaveAttempts) {
        saveAttempts++;
        console.log(`Database save attempt ${saveAttempts}/${maxSaveAttempts}`);
        
        try {
          saveResult = await saveBatchToDatabase(batchToRun);
          
          if (saveResult) {
            console.log('Database save successful on attempt', saveAttempts);
            break;
          }
        } catch (saveError) {
          console.error(`Save attempt ${saveAttempts} failed:`, saveError);
          if (saveAttempts === maxSaveAttempts) {
            throw new Error(`Failed to save batch after ${maxSaveAttempts} attempts: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!saveResult) {
        throw new Error('Failed to save batch to database after multiple attempts');
      }
      
      // Add delay to ensure database consistency and verify the batch exists
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const verificationResult = await verifyBatchInDatabase(batch.id);
      console.log('Batch verification result:', verificationResult);
      
      if (!verificationResult) {
        // Try one more save attempt with additional delay
        console.warn('Batch verification failed, attempting final save...');
        await new Promise(resolve => setTimeout(resolve, 300));
        const finalSaveResult = await saveBatchToDatabase(batchToRun);
        
        if (!finalSaveResult) {
          throw new Error('Batch verification failed and final save attempt unsuccessful');
        }
        
        // Verify again after final save
        await new Promise(resolve => setTimeout(resolve, 300));
        const finalVerification = await verifyBatchInDatabase(batch.id);
        
        if (!finalVerification) {
          throw new Error('Batch still not found in database after final verification');
        }
      }
      
      console.log('Batch verification complete, proceeding with automation...');
      
      // Update batch status to running immediately before starting automation
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

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatch
  };
};
