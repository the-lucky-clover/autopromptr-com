
import { useState } from 'react';
import { Batch } from '@/types/batch';
import { LangChainBatchProcessor } from '@/services/langchain/batchProcessor';

export const useLangChainBatchRunner = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunBatchWithLangChain = async (
    batch: Batch,
    setBatches: (updater: (prev: Batch[]) => Batch[]) => void,
    apiKey: string
  ) => {
    if (!apiKey) {
      throw new Error('OpenAI API key is required for LangChain processing');
    }

    setIsProcessing(true);

    try {
      const processor = new LangChainBatchProcessor();
      const result = await processor.processBatch(batch, {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'gpt-3.5-turbo'
      });

      // Update batch status based on processing result
      setBatches(prev =>
        prev.map(b =>
          b.id === batch.id
            ? {
                ...b,
                status: result.successfulPrompts === result.totalPrompts ? 'completed' : 'failed'
              }
            : b
        )
      );

      return result;
    } catch (error) {
      console.error('LangChain batch processing failed:', error);
      
      // Update batch status to failed
      setBatches(prev =>
        prev.map(b =>
          b.id === batch.id ? { ...b, status: 'failed' } : b
        )
      );

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleRunBatchWithLangChain,
    isProcessing
  };
};
