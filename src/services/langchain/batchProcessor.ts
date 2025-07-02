
import { Batch } from '@/types/batch';
import { LangChainClient } from './langchainClient';
import { AutoPromtprError } from '../autoPromptr';

export class LangChainBatchProcessor {
  private client: LangChainClient;

  constructor() {
    this.client = new LangChainClient();
  }

  async processBatch(batch: Batch, options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<any> {
    try {
      console.log('🦜 Starting LangChain batch processing...');
      
      if (!batch.prompts || batch.prompts.length === 0) {
        throw new AutoPromtprError(
          'No prompts provided for LangChain processing',
          'INVALID_BATCH',
          400,
          false
        );
      }

      const results = [];
      
      for (const prompt of batch.prompts) {
        try {
          const result = await this.client.processPrompt(prompt.text, options);
          results.push({
            promptId: prompt.id,
            success: true,
            result: result,
            error: null
          });
        } catch (error) {
          console.error('Error processing prompt:', error);
          results.push({
            promptId: prompt.id,
            success: false,
            result: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log('✅ LangChain batch processing completed');
      return {
        batchId: batch.id,
        totalPrompts: batch.prompts.length,
        successfulPrompts: results.filter(r => r.success).length,
        results: results
      };

    } catch (error) {
      console.error('💥 LangChain batch processing failed:', error);
      
      if (error instanceof AutoPromtprError) {
        throw error;
      }
      
      throw new AutoPromtprError(
        'LangChain batch processing failed',
        'LANGCHAIN_BATCH_ERROR',
        500,
        true
      );
    }
  }
}
