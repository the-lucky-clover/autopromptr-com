
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { supabase } from '@/integrations/supabase/client';

export const useBatchDatabase = () => {
  const { toast } = useToast();

  const saveBatchToDatabase = async (batch: Batch) => {
    try {
      console.log('Saving batch to database:', batch);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Save batch to Supabase
      const { error: batchError } = await supabase
        .from('batches')
        .upsert({
          id: batch.id,
          name: batch.name,
          platform: batch.platform,
          description: batch.description || '',
          status: batch.status,
          settings: batch.settings || {},
          created_at: batch.createdAt.toISOString(),
          created_by: user.id
        });

      if (batchError) {
        console.error('Error saving batch:', batchError);
        throw batchError;
      }

      // Save prompts to Supabase
      for (const prompt of batch.prompts) {
        const { error: promptError } = await supabase
          .from('prompts')
          .upsert({
            id: prompt.id,
            batch_id: batch.id,
            prompt_text: prompt.text,
            order_index: prompt.order,
            status: 'pending'
          });

        if (promptError) {
          console.error('Error saving prompt:', promptError);
          throw promptError;
        }
      }

      console.log('Batch and prompts saved to database successfully');
      return true;
    } catch (error) {
      console.error('Failed to save batch to database:', error);
      throw error;
    }
  };

  const verifyBatchInDatabase = async (batchId: string) => {
    const { data: existingBatch, error: checkError } = await supabase
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();
      
    if (checkError || !existingBatch) {
      throw new Error(`Batch ${batchId} not found in database after save attempt`);
    }
    
    return existingBatch;
  };

  return {
    saveBatchToDatabase,
    verifyBatchInDatabase
  };
};
