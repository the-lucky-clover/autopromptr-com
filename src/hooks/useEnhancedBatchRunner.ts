
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAutoPromptr } from '@/services/enhancedAutoPromptr';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { useBatchDatabase } from './useBatchDatabase';

export const useEnhancedBatchRunner = () => {
  const { toast } = useToast();
  const { saveBatchToDatabase, verifyBatchInDatabase } = useBatchDatabase();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);

  const handleRunBatchEnhanced = async (batch: Batch, setBatches: (updater: (prev: Batch[]) => Batch[]) => void) => {
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

    console.log('🚀 Starting ENHANCED batch run with REDUNDANT failover for:', batch.id, 'with platform:', detectedPlatform);

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to pending
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'pending' as const, errorMessage: undefined } : b
      ));

      // ENHANCED REDUNDANT settings
      const enhancedSettings = {
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: Math.max(batch.settings?.maxRetries ?? 2, 2), // Per backend
        automationDelay: batch.settings?.automationDelay ?? 3000,
        elementTimeout: batch.settings?.elementTimeout ?? 15000,
        debugLevel: batch.settings?.debugLevel ?? 'verbose'
      };

      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        settings: enhancedSettings,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('🔧 ENHANCED REDUNDANT batch configuration:', enhancedSettings);
      
      // Enhanced database save with better retry logic
      console.log('💾 Starting enhanced database save...');
      const saveResult = await saveBatchToDatabase(batchToRun);
      
      if (!saveResult) {
        throw new Error('Failed to save batch to database');
      }
      
      // Enhanced verification
      console.log('🔍 Enhanced database verification...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      const verificationResult = await verifyBatchInDatabase(batch.id);
      
      if (!verificationResult) {
        console.warn('⚠️ Database verification failed, attempting final save...');
        const finalSaveResult = await saveBatchToDatabase(batchToRun);
        if (!finalSaveResult) {
          throw new Error('Critical: Batch could not be verified in database');
        }
      }
      
      console.log('✅ Enhanced database operations complete');
      
      // Update to running status
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: 'running' as const, 
          platform: detectedPlatform, 
          settings: enhancedSettings,
          errorMessage: undefined
        } : b
      ));
      
      // Create ENHANCED AutoPromptr instance with redundancy
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      
      console.log('🎯 Starting ENHANCED REDUNDANT automation...');
      console.log('🔄 Failover strategy: Puppeteer Backend (3 attempts) → AutoPromptr Backend (3 attempts)');
      console.log('⏱️ Total maximum duration: ~6 minutes with 60-second delays between attempts');
      
      const runResult = await enhancedAutoPromptr.runBatchWithValidation(
        batchToRun, 
        detectedPlatform, 
        enhancedSettings
      );
      
      console.log('🎉 ENHANCED REDUNDANT automation completed:', runResult);
      
      toast({
        title: "Enhanced redundant batch started successfully",
        description: `Advanced automation with failover started for "${batch.name}" using ${platformName}. Primary: Puppeteer Backend, Fallback: AutoPromptr Backend (3 attempts each with 60s delays).`,
      });
      
    } catch (err) {
      console.error('💥 Enhanced redundant batch run failed:', err);
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Enhanced error categorization for redundant failures
        if (errorMessage.includes('REDUNDANCY_EXHAUSTED')) {
          errorMessage = 'All backends exhausted - Both Puppeteer and AutoPromptr failed after 6 attempts';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Backend endpoint not found (404) - Please check backend configuration';
        } else if (errorMessage.includes('database')) {
          errorMessage = 'Database operation failed - Please try again';
        }
      }
      
      // Update batch status to failed with error message
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: 'failed' as const,
          errorMessage: errorMessage
        } : b
      ));
      
      // Save failed status to database
      try {
        const failedBatch = {
          ...batch,
          status: 'failed' as const,
          errorMessage: errorMessage,
          platform: detectedPlatform
        };
        await saveBatchToDatabase(failedBatch);
      } catch (saveError) {
        console.error('Failed to save failed batch status to database:', saveError);
      }
      
      if (errorMessage.includes('REDUNDANCY_EXHAUSTED')) {
        toast({
          title: "All backends exhausted",
          description: "Both Puppeteer and AutoPromptr backends failed after 6 total attempts. Both services may be down.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('404')) {
        toast({
          title: "Backend endpoint not found",
          description: "The backend automation service is not available. Please check your backend configuration in Settings.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('database')) {
        toast({
          title: "Database operation failed",
          description: "Enhanced database save failed. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enhanced redundant batch failed",
          description: `Redundant automation failed: ${errorMessage}`,
          variant: "destructive",
        });
      }
      
    } finally {
      setAutomationLoading(false);
    }
  };

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatchEnhanced
  };
};
