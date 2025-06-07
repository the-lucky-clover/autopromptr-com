
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
        console.log('No authenticated user, skipping database save');
        return true; // Don't fail if no user is authenticated
      }
      
      // Ensure createdAt is properly formatted
      const createdAt = batch.createdAt instanceof Date 
        ? batch.createdAt.toISOString() 
        : new Date(batch.createdAt).toISOString();
      
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
          created_at: createdAt,
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
      // Don't throw the error - let the automation proceed even if database save fails
      return false;
    }
  };

  const verifyBatchInDatabase = async (batchId: string) => {
    try {
      const { data: existingBatch, error: checkError } = await supabase
        .from('batches')
        .select('id')
        .eq('id', batchId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw checkError;
      }
      
      return existingBatch || null;
    } catch (error) {
      console.warn('Could not verify batch in database:', error);
      return null; // Don't fail verification
    }
  };

  return {
    saveBatchToDatabase,
    verifyBatchInDatabase
  };
};
