// Cloudflare Worker Batch Processing Handler
import type { D1Database } from '@cloudflare/workers-types';

export interface BatchRequest {
  batch: {
    id: string;
    name: string;
    platform: string;
    prompts: Array<{
      id: string;
      prompt_text: string;
      order_index: number;
    }>;
  };
  platform: string;
  options?: {
    delay?: number;
    maxRetries?: number;
  };
}

export interface BatchResponse {
  success: boolean;
  batchId: string;
  status: string;
  processedPrompts?: number;
  totalPrompts?: number;
  error?: string;
}

export class BatchHandler {
  constructor(private db: D1Database) {}

  async runBatch(request: BatchRequest): Promise<BatchResponse> {
    const { batch, platform, options = {} } = request;
    const { delay = 1000, maxRetries = 3 } = options;

    try {
      // Update batch status to processing
      await this.updateBatchStatus(batch.id, 'processing');
      
      let processedPrompts = 0;
      const totalPrompts = batch.prompts.length;

      for (const prompt of batch.prompts) {
        try {
          // Update prompt status to processing
          await this.updatePromptStatus(prompt.id, 'processing');
          
          // Simulate prompt processing (replace with actual logic)
          const result = await this.processPrompt(prompt, platform);
          
          // Update prompt with result
          await this.updatePromptResult(prompt.id, 'completed', result);
          processedPrompts++;
          
          // Add delay between prompts if specified
          if (delay > 0 && processedPrompts < totalPrompts) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Failed to process prompt ${prompt.id}:`, error);
          await this.updatePromptResult(
            prompt.id, 
            'failed', 
            null, 
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Update final batch status
      const finalStatus = processedPrompts === totalPrompts ? 'completed' : 'completed_with_errors';
      await this.updateBatchStatus(batch.id, finalStatus);

      return {
        success: true,
        batchId: batch.id,
        status: finalStatus,
        processedPrompts,
        totalPrompts
      };
    } catch (error) {
      console.error('Batch processing failed:', error);
      await this.updateBatchStatus(batch.id, 'failed');
      
      return {
        success: false,
        batchId: batch.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async stopBatch(batchId: string): Promise<BatchResponse> {
    try {
      await this.updateBatchStatus(batchId, 'stopped');
      
      // Update any processing prompts to stopped
      await this.db.prepare(`
        UPDATE prompts 
        SET status = 'stopped', processed_at = CURRENT_TIMESTAMP 
        WHERE batch_id = ? AND status = 'processing'
      `).bind(batchId).run();

      return {
        success: true,
        batchId,
        status: 'stopped'
      };
    } catch (error) {
      console.error('Failed to stop batch:', error);
      return {
        success: false,
        batchId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    try {
      const batch = await this.db.prepare(`
        SELECT id, name, status, platform, created_at, started_at, completed_at, stopped_at
        FROM batches 
        WHERE id = ?
      `).bind(batchId).first();

      if (!batch) {
        throw new Error('Batch not found');
      }

      const prompts = await this.db.prepare(`
        SELECT id, status, processing_time_ms, error_message
        FROM prompts 
        WHERE batch_id = ?
        ORDER BY order_index
      `).bind(batchId).all();

      return {
        batch,
        prompts: prompts.results || []
      };
    } catch (error) {
      console.error('Failed to get batch status:', error);
      throw error;
    }
  }

  private async processPrompt(prompt: any, platform: string): Promise<string> {
    // Placeholder for actual prompt processing logic
    // This would integrate with the specific platform's API
    console.log(`Processing prompt ${prompt.id} for platform ${platform}`);
    console.log(`Prompt text: ${prompt.prompt_text}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `Processed prompt for ${platform}: ${prompt.prompt_text.substring(0, 50)}...`;
  }

  private async updateBatchStatus(batchId: string, status: string): Promise<void> {
    const timestamp = new Date().toISOString();
    let updateField = '';
    
    switch (status) {
      case 'processing':
        updateField = 'started_at = ?';
        break;
      case 'completed':
      case 'completed_with_errors':
      case 'failed':
        updateField = 'completed_at = ?';
        break;
      case 'stopped':
        updateField = 'stopped_at = ?';
        break;
    }

    const sql = `
      UPDATE batches 
      SET status = ?${updateField ? ', ' + updateField : ''}
      WHERE id = ?
    `;
    
    const params = updateField 
      ? [status, timestamp, batchId]
      : [status, batchId];

    await this.db.prepare(sql).bind(...params).run();
  }

  private async updatePromptStatus(promptId: string, status: string): Promise<void> {
    await this.db.prepare(`
      UPDATE prompts 
      SET status = ?, processing_started_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(status, promptId).run();
  }

  private async updatePromptResult(
    promptId: string, 
    status: string, 
    result: string | null, 
    errorMessage?: string
  ): Promise<void> {
    await this.db.prepare(`
      UPDATE prompts 
      SET status = ?, result = ?, error_message = ?, processed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(status, result, errorMessage || null, promptId).run();
  }
}