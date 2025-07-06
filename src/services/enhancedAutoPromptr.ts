import { AutoPromptr, AutoPromptrError } from './autoPromptr';
import { Batch } from '@/types/batch';

interface RunOptions {
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}

export class EnhancedAutoPromptr extends AutoPromptr {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  /**
   * Runs a batch with enhanced headers and timeout
   */
  async runBatch(batch: Batch, platform: string, options?: RunOptions): Promise<any> {
    try {
      console.log('✨ Running enhanced batch with options:', options);

      const enhancedOptions: RunOptions = {
        ...options,
        headers: {
          ...(options?.headers || {}),
          'X-Enhanced-Mode': 'true',
        },
        timeout: options?.timeout || 30000,
      };

      const result = await super.runBatch(batch, platform, enhancedOptions);
      console.log('✅ Enhanced batch completed successfully');
      return result;
    } catch (error) {
      console.error('💥 Enhanced batch run error:', error);
      throw AutoPromptrError.fromBackendError(error);
    }
  }

  /**
   * Optimizes a batch (stubbed for now)
   */
  async optimizeBatch(batch: Batch): Promise<Batch> {
    try {
      console.log(`🧠 Optimizing batch: ${batch.id}`);
      // Simulated async work
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        ...batch,
        name: `Optimized: ${batch.name}`,
        description: `Enhanced for better performance: ${batch.description ?? ''}`,
      };
    } catch (error) {
      console.error('🚫 Batch optimization error:', error);
      throw new AutoPromptrError(
        'Batch optimization failed',
        'OPTIMIZATION_ERROR',
        500,
        true
      );
    }
  }

  /**
   * Performs backend connection check
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('🚫 Connection validation failed:', error);
      return false;
    }
  }

  /**
   * Validates connection and then runs a batch with retry logic
   */
  async runBatchWithValidation(batch: Batch, platform: string, settings?: RunOptions): Promise<any> {
    try {
      console.log('🔄 Running batch with connection validation...');

      const isValid = await this.validateConnection();
      if (!isValid) {
        throw new AutoPromptrError(
          'Backend connection validation failed',
          'CONNECTION_VALIDATION_ERROR',
          500,
          true
        );
      }

      return await this.runBatch(batch, platform, settings);
    } catch (error) {
      console.error('💥 Batch with validation failed:', error);
      throw AutoPromptrError.fromBackendError(error);
    }
  }
}
