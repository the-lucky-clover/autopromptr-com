import { LangChainClient } from './langchainClient';
import { Batch, PromptResult } from '@/types/batch';

interface LangChainBatchProcessorOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  maxRetries?: number;          // retries per prompt
  concurrency?: number;         // how many prompts processed in parallel
  retryBackoffMs?: number;      // base delay for exponential backoff
  onProgress?: (completed: number, total: number) => void; // progress callback
}

export class LangChainBatchProcessor {
  private client: LangChainClient;
  private maxRetries: number;
  private concurrency: number;
  private retryBackoffMs: number;
  private onProgress?: (completed: number, total: number) => void;

  constructor() {
    this.client = new LangChainClient();
    this.maxRetries = 3;
    this.concurrency = 3;
    this.retryBackoffMs = 1000;
  }

  public async processBatch(
    batch: Batch,
    options: LangChainBatchProcessorOptions = {}
  ): Promise<{ results: PromptResult[] }> {
    this.maxRetries = options.maxRetries ?? 3;
    this.concurrency = options.concurrency ?? 3;
    this.retryBackoffMs = options.retryBackoffMs ?? 1000;
    this.onProgress = options.onProgress;

    if (!batch.prompts || batch.prompts.length === 0) {
      throw new Error('Batch contains no prompts to process.');
    }

    const total = batch.prompts.length;
    let completedCount = 0;

    const results: PromptResult[] = [];

    // Process prompts with concurrency limit
    const executing: Promise<void>[] = [];

    // Helper to process a single prompt with retry
    const processPromptWithRetry = async (promptText: string, promptId: string): Promise<PromptResult> => {
      let attempt = 0;
      while (attempt <= this.maxRetries) {
        try {
          const response = await this.client.callModel({
            prompt: promptText,
            temperature: options.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? 1000,
            model: options.model ?? 'gpt-3.5-turbo',
          });

          return {
            promptId,
            promptText,
            success: true,
            responseText: response.text ?? '',
            error: null,
          };
        } catch (error) {
          attempt++;
          if (attempt > this.maxRetries) {
            return {
              promptId,
              promptText,
              success: false,
              responseText: '',
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
          // Exponential backoff delay before retrying
          const delay = this.retryBackoffMs * Math.pow(2, attempt - 1);
          await new Promise(res => setTimeout(res, delay));
        }
      }
      // Should never reach here but fallback fail-safe
      return {
        promptId,
        promptText,
        success: false,
        responseText: '',
        error: 'Failed after retries',
      };
    };

    // Runner that respects concurrency limit
    const runQueue = async () => {
      for (let i = 0; i < batch.prompts.length; i++) {
        // Wait if concurrency limit reached
        while (executing.length >= this.concurrency) {
          await Promise.race(executing);
        }

        const prompt = batch.prompts[i];
        const p = processPromptWithRetry(prompt.text ?? '', prompt.id).then(result => {
          results.push(result);
          completedCount++;
          if (this.onProgress) {
            this.onProgress(completedCount, total);
          }
          // Remove this promise from executing array when done
          executing.splice(executing.indexOf(p), 1);
        });

        executing.push(p);
      }

      // Wait for all remaining to finish
      await Promise.all(executing);
    };

    await runQueue();

    return { results };
  }
}
