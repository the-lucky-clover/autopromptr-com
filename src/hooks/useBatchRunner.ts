
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';
import { AutoPromptprError } from '@/services/autoPromptr';
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

    // Check if any batch is already running
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

    console.log('🚀 Starting enhanced batch run with improved connectivity:', batch.id);

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to pending
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'pending' as const } : b
      ));

      // Enhanced settings with better defaults
      const enhancedSettings = {
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: Math.max(batch.settings?.maxRetries ?? 3, 3),
        automationDelay: batch.settings?.automationDelay ?? 2000,
        elementTimeout: batch.settings?.elementTimeout ?? 15000,
        debugLevel: batch.settings?.debugLevel ?? 'detailed'
      };

      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        settings: enhancedSettings,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('💾 Enhanced database save process starting...');
      
      // Enhanced database save with validation
      const saveResult = await saveBatchToDatabase(batchToRun);
      if (!saveResult) {
        throw new AutoPromptprError(
          'Failed to save batch to database',
          'DATABASE_SAVE_FAILED',
          500,
          true
        );
      }
      
      // Database verification
      console.log('🔍 Enhanced database verification...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const verificationResult = await verifyBatchInDatabase(batch.id);
      
      if (!verificationResult) {
        console.warn('⚠️ Database verification failed, attempting final save...');
        const finalSaveResult = await saveBatchToDatabase(batchToRun);
        if (!finalSaveResult) {
          throw new AutoPromptprError(
            'Critical: Batch could not be verified in database',
            'DATABASE_VERIFICATION_FAILED',
            500,
            true
          );
        }
      }
      
      console.log('✅ Database operations complete, starting enhanced backend communication...');
      
      // Update to running status
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' as const, platform: detectedPlatform, settings: enhancedSettings } : b
      ));
      
      // Use Enhanced AutoPromptr with validation
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      
      console.log('🎯 Starting enhanced automation with validated connectivity...');
      const runResult = await enhancedAutoPromptr.runBatchWithValidation(
        batchToRun, 
        detectedPlatform, 
        enhancedSettings
      );
      
      console.log('🎉 Enhanced automation completed successfully:', runResult);
      
      toast({
        title: "Batch started successfully",
        description: `Enhanced automation started for "${batch.name}" using ${platformName} with validated connectivity.`,
      });
      
    } catch (err) {
      console.error('💥 Enhanced batch run failed:', err);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof AutoPromptprError) {
        errorMessage = err.message;
        
        // Handle specific error cases with better guidance
        switch (err.code) {
          case 'CONNECTION_VALIDATION_FAILED':
            toast({
              title: "Connection validation failed",
              description: "Please check your backend configuration in Settings and run the Connection Wizard.",
              variant: "destructive",
            });
            return;
            
          case 'NETWORK_CONNECTION_FAILED':
            toast({
              title: "Network connection failed",
              description: "Unable to connect to backend. Please verify the backend URL in Settings.",
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
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
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
