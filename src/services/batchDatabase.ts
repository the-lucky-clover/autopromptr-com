
import { cloudflare } from '@/integrations/cloudflare/client';
import { Batch } from '@/types/batch';

export const saveBatchToDatabase = async (batch: Batch): Promise<boolean> => {
  try {
    console.log('Saving batch to database:', batch.id);
    
    const { data: { session }, error: authError } = await cloudflare.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication required');
    }
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const createdAt = batch.createdAt instanceof Date 
      ? batch.createdAt.toISOString() 
      : new Date(batch.createdAt).toISOString();
    
    const batchData = {
      id: batch.id,
      name: batch.name,
      platform: batch.platform || 'unknown',
      description: batch.description || '',
      status: batch.status || 'pending',
      settings_json: JSON.stringify(batch.settings || {}),
      created_at: createdAt,
      user_id: session.user.id,
      target_url: batch.targetUrl || ''
    };
    
    const { error: batchError } = await cloudflare.db
      .from('batches')
      .insert([batchData]);

    if (batchError) {
      console.error('Error saving batch:', batchError);
      throw new Error(`Database error: ${batchError.message}`);
    }
    
    console.log('Batch saved successfully:', batch.id);

    if (batch.prompts && batch.prompts.length > 0) {
      for (const prompt of batch.prompts) {
        const promptData = {
          id: prompt.id,
          batch_id: batch.id,
          prompt_text: prompt.text,
          order_index: prompt.order,
          status: 'pending'
        };
        
        const { error: promptError } = await cloudflare.db
          .from('prompts')
          .insert([promptData]);

        if (promptError) {
          console.error('Error saving prompt:', promptError);
          throw new Error(`Prompt save error: ${promptError.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to save batch to database:', error);
    return false;
  }
};

export const verifyBatchInDatabase = async (batchId: string): Promise<boolean> => {
  try {
    const { data: existingBatch, error: checkError } = await cloudflare.db
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();
      
    if (checkError) {
      if (checkError.message?.includes('not found')) {
        return false; // Batch not found
      }
      throw checkError;
    }
    
    return !!existingBatch;
  } catch (error) {
    console.error('Could not verify batch in database:', error);
    return false;
  }
};
