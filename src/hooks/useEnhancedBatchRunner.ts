
import { useState } from 'react';
import { Batch } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';
import { EnhancedAutoPromptrClient } from '@/services/autoPromptr/enhancedClient';
import { saveBatchToDatabase, verifyBatchInDatabase } from '@/services/batchDatabase';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedBatchRunner = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [automationLoading, setAutomationLoading] = useState(false);
  const { toast } = useToast();

  const handleRunBatchEnhanced = async (
    batch: Batch,
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void
  ) => {
    const detectedPlatform = detectPlatformFromUrl(batch.targetUrl);
    const platformName = getPlatformName(detectedPlatform);

    if (!detectedPlatform) {
      toast({
        title: 'Cannot detect platform',
        description: 'Unable to determine automation platform from the target URL. Please check the URL format.',
        variant: 'destructive',
      });
      return;
    }

    let runningBatch: Batch[] = [];
    await new Promise<void>((resolve) => {
      setBatches((prev: Batch[]) => {
        runningBatch = Array.isArray(prev)
          ? prev.filter(b => b.status === 'running')
          : [];
        resolve();
        return prev;
      });
    });

    if (runningBatch.length > 0) {
      toast({
        title: 'Batch already running',
        description: `Cannot start "${batch.name}" because "${runningBatch[0].name}" is already processing.`,
        variant: 'destructive',
      });
      return;
    }

    console.group(`🚀 Starting Enhanced Batch: ${batch.id}`);
    console.log('Detected Platform:', detectedPlatform);
    console.log('Failover Strategy: Puppeteer → AutoPromptr (3 attempts each)');

    setSelectedBatchId(batch.id);
    setAutomationLoading(true);

    try {
      setBatches(prev =>
        prev.map(b =>
          b.id === batch.id ? { ...b, status: 'pending', errorMessage: undefined } : b
        )
      );

      const enhancedSettings: NonNullable<Batch['settings']> = {
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: Math.min(Math.max(batch.settings?.maxRetries ?? 2, 2), 5),
        automationDelay: batch.settings?.automationDelay ?? 3000,
        elementTimeout: batch.settings?.elementTimeout ?? 15000,
        debugLevel: batch.settings?.debugLevel ?? 'verbose',
        ...batch.settings,
      };

      const batchToRun: Batch = {
        ...batch,
        platform: detectedPlatform,
        status: 'pending',
        settings: enhancedSettings,
        createdAt:
          batch.createdAt instanceof Date
            ? batch.createdAt
            : new Date(batch.createdAt ?? Date.now()),
      };

      console.log('💾 Saving batch to database...');
      if (!(await saveBatchToDatabase(batchToRun))) {
        throw new Error('Failed to save batch to database');
      }

      await new Promise(res => setTimeout(res, 1500));

      if (!(await verifyBatchInDatabase(batch.id))) {
        console.warn('⚠️ Verification failed — retrying save...');
        if (!(await saveBatchToDatabase(batchToRun))) {
          throw new Error('Critical: Batch could not be verified in database');
        }
      }

      setBatches(prev =>
        prev.map(b =>
          b.id === batch.id
            ? {
                ...b,
                status: 'running',
                platform: detectedPlatform,
                settings: enhancedSettings,
              }
            : b
        )
      );

      const enhancedAutoPromptr = new EnhancedAutoPromptrClient();
      console.log('📦 Initiating batch run with enhanced failover...');
      await enhancedAutoPromptr.runBatchWithValidation(batchToRun, detectedPlatform, enhancedSettings);

      toast({
        title: 'Enhanced batch running',
        description: `Automation with failover started for "${batch.name}" using ${platformName}.`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error occurred';
      let finalMessage = error.toLowerCase();

      if (finalMessage.includes('redundancy_exhausted')) {
        finalMessage = 'All backends exhausted — Puppeteer and AutoPromptr failed.';
      } else if (finalMessage.includes('404')) {
        finalMessage = 'Backend endpoint not found (404).';
      } else if (finalMessage.includes('database')) {
        finalMessage = 'Database operation failed.';
      }

      console.error('❌ Batch run failed:', finalMessage);

      setBatches(prev =>
        prev.map(b =>
          b.id === batch.id ? { ...b, status: 'failed', errorMessage: finalMessage } : b
        )
      );

      try {
        await saveBatchToDatabase({
          ...batch,
          status: 'failed',
          errorMessage: finalMessage,
          platform: detectedPlatform,
        });
      } catch (dbErr) {
        console.error('⚠️ Failed to persist failed status:', dbErr);
      }

      toast({
        title: 'Enhanced batch failed',
        description: finalMessage,
        variant: 'destructive',
      });
    } finally {
      setAutomationLoading(false);
      console.groupEnd();
    }
  };

  return {
    selectedBatchId,
    automationLoading,
    handleRunBatchEnhanced,
  };
};
