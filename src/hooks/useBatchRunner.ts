
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr, AutoPromtrError } from '@/services/autoPromptr';
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

    console.log('Starting enhanced batch run process for:', batch.id, 'with platform:', detectedPlatform);

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
      
      console.log('Enhanced batch save process starting...');
      console.log('Batch data being saved:', JSON.stringify(batchToRun, null, 2));
      
      // Enhanced database save with better retry logic
      let saveAttempts = 0;
      const maxSaveAttempts = 5; // Increased from 3
      let saveResult = false;
      
      while (!saveResult && saveAttempts < maxSaveAttempts) {
        saveAttempts++;
        console.log(`Enhanced database save attempt ${saveAttempts}/${maxSaveAttempts}`);
        
        try {
          saveResult = await saveBatchToDatabase(batchToRun);
          
          if (saveResult) {
            console.log('Enhanced database save successful on attempt', saveAttempts);
            break;
          }
        } catch (saveError) {
          console.error(`Enhanced save attempt ${saveAttempts} failed:`, saveError);
          if (saveAttempts === maxSaveAttempts) {
            throw new AutoPromtrError(
              `Failed to save batch after ${maxSaveAttempts} attempts: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`,
              'DATABASE_SAVE_FAILED',
              500,
              false
            );
          }
          // Progressive backoff: 500ms, 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, saveAttempts - 1)));
        }
      }
      
      if (!saveResult) {
        throw new AutoPromtrError(
          'Failed to save batch to database after multiple attempts',
          'DATABASE_SAVE_FAILED',
          500,
          false
        );
      }
      
      // Enhanced database verification with longer wait
      console.log('Enhanced database verification starting...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased from 500ms
      
      let verificationAttempts = 0;
      const maxVerificationAttempts = 3;
      let verificationResult = null;
      
      while (!verificationResult && verificationAttempts < maxVerificationAttempts) {
        verificationAttempts++;
        console.log(`Enhanced verification attempt ${verificationAttempts}/${maxVerificationAttempts}`);
        
        verificationResult = await verifyBatchInDatabase(batch.id);
        
        if (!verificationResult && verificationAttempts < maxVerificationAttempts) {
          console.warn(`Verification attempt ${verificationAttempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * verificationAttempts));
        }
      }
      
      if (!verificationResult) {
        console.warn('Database verification failed after all attempts, but proceeding with caution');
        
        // One final save attempt before proceeding
        console.log('Final database save attempt before proceeding...');
        const finalSaveResult = await saveBatchToDatabase(batchToRun);
        
        if (!finalSaveResult) {
          throw new AutoPromtrError(
            'Critical: Batch could not be verified in database and final save failed',
            'DATABASE_VERIFICATION_FAILED',
            500,
            true
          );
        }
      }
      
      console.log('Enhanced database operations complete, starting backend communication...');
      
      // Update batch status to running immediately before starting automation
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform } : b
      ));
      
      // Create enhanced AutoPromptr instance and run the batch
      const autoPromptr = new AutoPromptr();
      
      console.log('Starting enhanced automation with AutoPromptr...');
      const runResult = await autoPromptr.runBatch(batch.id, detectedPlatform, batch.settings || { delay: 5000, maxRetries: 3 });
      console.log('Enhanced AutoPromptr run result:', runResult);
      
      toast({
        title: "Batch started successfully",
        description: `Automation started for "${batch.name}" using ${platformName}.`,
      });
    } catch (err) {
      console.error('Enhanced batch run failed:', err);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      
      let errorMessage = 'Unknown error occurred';
      let shouldRetry = false;
      
      if (err instanceof AutoPromtrError) {
        errorMessage = err.message;
        shouldRetry = err.retryable;
        
        // Handle specific error cases with better user guidance
        switch (err.code) {
          case 'BACKEND_COLD_START':
            toast({
              title: "Backend is starting up",
              description: "The backend service is initializing. Please wait 30-60 seconds and try again.",
              variant: "destructive",
            });
            return;
            
          case 'BATCH_NOT_FOUND':
            toast({
              title: "Batch not found in backend",
              description: "The batch wasn't found in the backend database. Try recreating the batch.",
              variant: "destructive",
            });
            return;
            
          case 'DATABASE_SAVE_FAILED':
          case 'DATABASE_VERIFICATION_FAILED':
            toast({
              title: "Database operation failed",
              description: "There was an issue saving to the database. Please try again.",
              variant: "destructive",
            });
            return;
            
          case 'REQUEST_TIMEOUT':
            toast({
              title: "Request timed out",
              description: "The backend took too long to respond. It may be starting up.",
              variant: "destructive",
            });
            return;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Failed to start batch",
        description: shouldRetry ? `${errorMessage} Please try again.` : errorMessage,
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
