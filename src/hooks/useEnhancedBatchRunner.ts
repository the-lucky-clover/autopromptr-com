
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

    console.log('🚀 Starting ENHANCED batch run process for:', batch.id, 'with platform:', detectedPlatform);

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);
    
    try {
      // Update batch status to pending
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'pending' as const } : b
      ));

      // ENHANCED settings optimized for Lovable
      const enhancedSettings = {
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: Math.max(batch.settings?.maxRetries ?? 5, 5), // Increased retries
        automationDelay: batch.settings?.automationDelay ?? 3000, // Longer initial delay
        elementTimeout: batch.settings?.elementTimeout ?? 15000, // Longer element timeout
        debugLevel: batch.settings?.debugLevel ?? 'verbose' // More detailed logging
      };

      const batchToRun = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending' as const,
        settings: enhancedSettings,
        createdAt: batch.createdAt instanceof Date ? batch.createdAt : new Date(batch.createdAt)
      };
      
      console.log('🔧 ENHANCED batch configuration:', enhancedSettings);
      
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
          settings: enhancedSettings 
        } : b
      ));
      
      // Create ENHANCED AutoPromptr instance
      const enhancedAutoPromptr = new EnhancedAutoPromptr();
      
      console.log('🎯 Starting ENHANCED automation with Lovable optimizations...');
      const runResult = await enhancedAutoPromptr.runBatchWithValidation(
        batchToRun, 
        detectedPlatform, 
        enhancedSettings
      );
      
      console.log('🎉 ENHANCED automation completed:', runResult);
      
      toast({
        title: "Enhanced batch started successfully",
        description: `Advanced automation started for "${batch.name}" using ${platformName} with ${enhancedSettings.maxRetries} retries and enhanced Lovable optimization.`,
      });
      
    } catch (err) {
      console.error('💥 Enhanced batch run failed:', err);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' as const } : b
      ));
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Enhanced error categorization
        if (errorMessage.includes('database')) {
          toast({
            title: "Database operation failed",
            description: "Enhanced database save failed. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (errorMessage.includes('CHAT_INPUT_NOT_FOUND')) {
          toast({
            title: "Chat input not detected",
            description: "Enhanced element detection couldn't find the chat input. The page may not be fully loaded.",
            variant: "destructive",
          });
          return;
        }
        
        if (errorMessage.includes('TEXT_AUTOMATION_FAILED')) {
          toast({
            title: "Text automation failed",
            description: "Enhanced text entry failed after multiple attempts. Please check the target URL.",
            variant: "destructive",
          });
          return;
        }
      }
      
      toast({
        title: "Enhanced batch failed",
        description: `Enhanced automation failed: ${errorMessage}`,
        variant: "destructive",
      });
      
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
