import { AutoPromptr } from './autoPromptr';
import { AutoPromptrError } from './autoPromptr';
import { Batch } from '@/types/batch';

export class EnhancedAutoPromptr extends AutoPromptr {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  async runBatch(batch: Batch, platform: string, options?: any): Promise<any> {
    try {
      console.log('✨ Running enhanced batch with options:', options);
      const enhancedOptions = {
        ...options,
        headers: {
          ...options?.headers,
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

  async optimizeBatch(batch: Batch): Promise<Batch> {
    try {
      console.log('Optimizing batch:', batch.id);
      // Placeholder for actual optimization logic
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        ...batch,
        name: `Optimized: ${batch.name}`,
        description: `Enhanced for better performance: ${batch.description}`,
      };
    } catch (error) {
      console.error('Batch optimization error:', error);
      throw new AutoPromptrError(
        'Batch optimization failed',
        'OPTIMIZATION_ERROR',
        500,
        true
      );
    }
  }
}
