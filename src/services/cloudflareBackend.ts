import { cloudflare } from '@/integrations/cloudflare/client';

export interface CloudflareBatch {
  id: string;
  name: string;
  description?: string;
  platform: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  stopped_at?: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
  percentage: number;
}

export interface BatchTask {
  id: string;
  prompt: string;
  status: string;
  result?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface BatchJobStatus {
  job: CloudflareBatch;
  progress: BatchProgress;
  tasks: BatchTask[];
}

/**
 * Cloudflare Workers Backend Client
 * Handles batch automation via Cloudflare Workers and D1
 */
export class CloudflareBackend {
  /**
   * Create a new batch job
   */
  async createBatch(
    name: string,
    prompts: Array<string | { text: string; platform?: string }>,
    description?: string,
    platform: string = 'web',
    settings?: Record<string, any>
  ): Promise<{ job_id: string; status: string; message: string }> {
    try {
      const { data, error } = await cloudflare.functions.invoke('batch-orchestrator/create', {
        body: {
          name,
          description,
          prompts,
          platform,
          settings,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create batch:', error);
      throw error;
    }
  }

  /**
   * Start execution of a batch job
   */
  async runBatch(jobId: string): Promise<{ message: string; job_id: string; status: string }> {
    try {
      const { data, error } = await cloudflare.functions.invoke(`batch-orchestrator/run/${jobId}`, {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Failed to run batch ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get the status of a batch job
   */
  async getBatchStatus(jobId: string): Promise<BatchJobStatus> {
    try {
      const { data, error } = await cloudflare.functions.invoke(`batch-orchestrator/status/${jobId}`, {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Failed to get status for batch ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Stop execution of a batch job
   */
  async stopBatch(jobId: string): Promise<{ status: string; job_id: string; message: string }> {
    try {
      const { data, error } = await cloudflare.functions.invoke(`batch-orchestrator/stop/${jobId}`, {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Failed to stop batch ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * List all batch jobs
   */
  async listBatches(): Promise<{
    active_jobs: CloudflareBatch[];
    job_history: CloudflareBatch[];
  }> {
    try {
      const { data, error } = await cloudflare.functions.invoke('batch-orchestrator/list', {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to list batches:', error);
      throw error;
    }
  }

  /**
   * Test Gemini AI integration
   */
  async testGemini(prompt: string = 'Hello, this is a test prompt'): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await cloudflare.functions.invoke('gemini-processor', {
        body: {
          prompt_text: prompt,
        },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Failed to test Gemini:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect platform type from URL
   */
  async detectPlatform(url: string): Promise<{
    platform: string;
    confidence: number;
    chat_selectors: string[];
    submit_methods: string[];
    metadata?: Record<string, any>;
  }> {
    try {
      const { data, error } = await cloudflare.functions.invoke('platform-detector', {
        body: { url },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to detect platform:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
  }> {
    try {
      // Check if we can access Cloudflare D1
      const { data, error } = await cloudflare.from('batches').select('count').limit(1);

      if (error) throw error;

      return {
        status: 'healthy',
        service: 'cloudflare-workers-backend',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        service: 'cloudflare-workers-backend',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create and run batch in one call (legacy compatibility)
   */
  async runBatchCombined(
    batch: {
      name?: string;
      description?: string;
      prompts: Array<{ text: string }>;
      targetUrl?: string;
    },
    platform: string = 'web',
    options?: Record<string, any>
  ): Promise<{ job_id: string; status: string; message: string; batch_id: string }> {
    try {
      const name = batch.name || `Batch-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
      
      // Create batch
      const createResult = await this.createBatch(
        name,
        batch.prompts,
        batch.description,
        platform,
        {
          targetUrl: batch.targetUrl,
          ...options,
        }
      );

      // Start batch
      const runResult = await this.runBatch(createResult.job_id);

      return {
        job_id: createResult.job_id,
        status: runResult.status,
        message: runResult.message,
        batch_id: createResult.job_id,
      };
    } catch (error) {
      console.error('Failed to create and run batch:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cloudflareBackend = new CloudflareBackend();

// Legacy export aliases for backwards compatibility
export const lovableCloudBackend = cloudflareBackend;
export type LovableCloudBatch = CloudflareBatch;
