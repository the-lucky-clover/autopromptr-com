
import { LangChainClient } from './langchainClient';
import { Batch, TextPrompt } from '@/types/batch';
import { AutoPromtrError } from '../autoPromptr';

export interface BatchProcessingOptions {
  waitBetweenPrompts?: number;
  maxWaitForTarget?: number;
  retryFailedPrompts?: boolean;
  maxRetries?: number;
}

export interface ProcessingResult {
  promptId: string;
  success: boolean;
  result?: string;
  error?: string;
  processingTime: number;
}

export class LangChainBatchProcessor {
  private langchainClient: LangChainClient;
  private processingOptions: Required<BatchProcessingOptions>;

  constructor(langchainClient: LangChainClient, options: BatchProcessingOptions = {}) {
    this.langchainClient = langchainClient;
    this.processingOptions = {
      waitBetweenPrompts: options.waitBetweenPrompts || 3000,
      maxWaitForTarget: options.maxWaitForTarget || 30000,
      retryFailedPrompts: options.retryFailedPrompts || true,
      maxRetries: options.maxRetries || 2
    };
  }

  async processBatch(batch: Batch): Promise<ProcessingResult[]> {
    console.log(`🚀 Starting LangChain batch processing for: ${batch.name}`);
    console.log(`📊 Processing ${batch.prompts.length} prompts for target: ${batch.targetUrl}`);
    
    const results: ProcessingResult[] = [];
    
    // Sort prompts by order
    const sortedPrompts = [...batch.prompts].sort((a, b) => a.order - b.order);
    
    for (let i = 0; i < sortedPrompts.length; i++) {
      const prompt = sortedPrompts[i];
      console.log(`📝 Processing prompt ${i + 1}/${sortedPrompts.length}: ${prompt.id}`);
      
      const result = await this.processPromptWithRetries(prompt, batch.targetUrl);
      results.push(result);
      
      // Wait between prompts if not the last one
      if (i < sortedPrompts.length - 1) {
        console.log(`⏳ Waiting ${this.processingOptions.waitBetweenPrompts}ms before next prompt...`);
        await new Promise(resolve => setTimeout(resolve, this.processingOptions.waitBetweenPrompts));
      }
    }
    
    console.log(`✅ LangChain batch processing completed. Success rate: ${results.filter(r => r.success).length}/${results.length}`);
    return results;
  }

  private async processPromptWithRetries(prompt: TextPrompt, targetUrl: string): Promise<ProcessingResult> {
    const startTime = Date.now();
    let lastError: string = '';
    
    for (let attempt = 0; attempt <= this.processingOptions.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${this.processingOptions.maxRetries} for prompt: ${prompt.id}`);
        }
        
        // Wait for target availability
        const isTargetAvailable = await this.langchainClient.waitForTargetAvailability(
          targetUrl, 
          this.processingOptions.maxWaitForTarget
        );
        
        if (!isTargetAvailable) {
          throw new Error(`Target ${targetUrl} not available after waiting`);
        }
        
        // Process the prompt
        const result = await this.langchainClient.processPrompt(prompt.text, targetUrl);
        
        return {
          promptId: prompt.id,
          success: true,
          result,
          processingTime: Date.now() - startTime
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Attempt ${attempt + 1} failed for prompt ${prompt.id}:`, lastError);
        
        // Wait before retry (except on last attempt)
        if (attempt < this.processingOptions.maxRetries) {
          const retryDelay = 2000 * Math.pow(1.5, attempt); // Progressive backoff
          console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    return {
      promptId: prompt.id,
      success: false,
      error: lastError,
      processingTime: Date.now() - startTime
    };
  }

  async stopProcessing(): Promise<void> {
    console.log('🛑 LangChain batch processing stop requested');
    // Implementation for stopping processing would go here
    // For now, we'll rely on the natural completion of the current prompt
  }
}
