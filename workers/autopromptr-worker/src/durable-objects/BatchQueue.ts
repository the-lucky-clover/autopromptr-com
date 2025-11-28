// BatchQueue Durable Object - Replaces Cloudflare Queues (not in free tier)
// Manages batch processing state and coordinates prompt execution

export interface BatchState {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
  currentPromptIndex: number;
  totalPrompts: number;
  startedAt?: string;
  completedAt?: string;
  results: PromptResult[];
  errors: string[];
}

export interface PromptResult {
  promptId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export class BatchQueue {
  private state: DurableObjectState;
  private env: any;
  private batches: Map<string, BatchState>;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.batches = new Map();
    
    // Block concurrent writes during initialization
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, BatchState>>('batches');
      if (stored) {
        this.batches = new Map(stored);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Create or queue a new batch
      if (path === '/queue' && request.method === 'POST') {
        const data = await request.json<any>();
        return await this.queueBatch(data);
      }

      // Get batch status
      if (path.startsWith('/status/')) {
        const batchId = path.split('/').pop();
        return await this.getBatchStatus(batchId!);
      }

      // Process next prompt in batch
      if (path === '/process-next' && request.method === 'POST') {
        const { batchId } = await request.json<{ batchId: string }>();
        return await this.processNext(batchId);
      }

      // Stop a batch
      if (path === '/stop' && request.method === 'POST') {
        const { batchId } = await request.json<{ batchId: string }>();
        return await this.stopBatch(batchId);
      }

      // Get all active batches
      if (path === '/active') {
        return this.getActiveBatches();
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('BatchQueue DO error:', error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async queueBatch(data: any): Promise<Response> {
    const { batchId, prompts, targetUrl, platform } = data;

    const batchState: BatchState = {
      id: batchId,
      status: 'pending',
      currentPromptIndex: 0,
      totalPrompts: prompts.length,
      results: prompts.map((p: any) => ({
        promptId: p.id,
        status: 'pending'
      })),
      errors: []
    };

    this.batches.set(batchId, batchState);
    await this.persist();

    // Auto-start processing
    this.startProcessing(batchId, prompts, targetUrl, platform);

    return new Response(JSON.stringify({
      success: true,
      batchId,
      status: 'queued'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async startProcessing(
    batchId: string, 
    prompts: any[], 
    targetUrl: string, 
    platform: string
  ): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    batch.status = 'processing';
    batch.startedAt = new Date().toISOString();
    await this.persist();

    // Process prompts sequentially
    for (let i = 0; i < prompts.length; i++) {
      const currentBatch = this.batches.get(batchId);
      if (!currentBatch || currentBatch.status === 'stopped') {
        break;
      }

      currentBatch.currentPromptIndex = i;
      currentBatch.results[i].status = 'processing';
      currentBatch.results[i].startedAt = new Date().toISOString();
      await this.persist();

      try {
        // Call the automation service (using Browser Rendering API)
        const result = await this.executePrompt(prompts[i], targetUrl, platform);
        
        currentBatch.results[i].status = 'completed';
        currentBatch.results[i].completedAt = new Date().toISOString();
        currentBatch.results[i].result = result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        currentBatch.results[i].status = 'failed';
        currentBatch.results[i].error = errorMsg;
        currentBatch.errors.push(errorMsg);
      }

      await this.persist();
      
      // Add delay between prompts (configurable)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Mark batch as complete
    const finalBatch = this.batches.get(batchId);
    if (finalBatch && finalBatch.status !== 'stopped') {
      finalBatch.status = 'completed';
      finalBatch.completedAt = new Date().toISOString();
      await this.persist();
    }
  }

  private async executePrompt(prompt: any, targetUrl: string, platform: string): Promise<any> {
    // This would integrate with Cloudflare Browser Rendering API
    // For now, return a simulated result
    console.log(`Executing prompt ${prompt.id} on ${platform} at ${targetUrl}`);
    
    // In production, this would call:
    // const browser = await puppeteer.launch(this.env.BROWSER);
    // ... automation logic ...
    
    return {
      success: true,
      promptId: prompt.id,
      executedAt: new Date().toISOString()
    };
  }

  private async getBatchStatus(batchId: string): Promise<Response> {
    const batch = this.batches.get(batchId);
    
    if (!batch) {
      return new Response(JSON.stringify({ error: 'Batch not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(batch), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async processNext(batchId: string): Promise<Response> {
    const batch = this.batches.get(batchId);
    
    if (!batch) {
      return new Response(JSON.stringify({ error: 'Batch not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process is automatically handled by startProcessing
    return new Response(JSON.stringify({
      success: true,
      currentIndex: batch.currentPromptIndex,
      status: batch.status
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async stopBatch(batchId: string): Promise<Response> {
    const batch = this.batches.get(batchId);
    
    if (!batch) {
      return new Response(JSON.stringify({ error: 'Batch not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    batch.status = 'stopped';
    batch.completedAt = new Date().toISOString();
    await this.persist();

    return new Response(JSON.stringify({
      success: true,
      batchId,
      status: 'stopped'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private getActiveBatches(): Response {
    const active = Array.from(this.batches.values())
      .filter(b => b.status === 'processing' || b.status === 'pending');

    return new Response(JSON.stringify(active), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async persist(): Promise<void> {
    await this.state.storage.put('batches', Array.from(this.batches.entries()));
  }

  // Alarm API for scheduled processing (optional)
  async alarm(): Promise<void> {
    console.log('BatchQueue alarm triggered');
    // Could be used for cleanup or retry logic
  }
}
