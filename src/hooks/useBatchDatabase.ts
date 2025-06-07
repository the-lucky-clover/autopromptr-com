
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { supabase } from '@/integrations/supabase/client';

export const useBatchDatabase = () => {
  const { toast } = useToast();

  const saveBatchToDatabase = async (batch: Batch): Promise<boolean> => {
    try {
      console.log('Starting database save for batch:', batch.id);
      console.log('Batch data to save:', JSON.stringify(batch, null, 2));
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
      }
      
      if (!user) {
        console.log('No authenticated user, but continuing with save attempt');
        // Don't fail - allow the batch to be saved without user association
      }
      
      // Ensure createdAt is properly formatted
      const createdAt = batch.createdAt instanceof Date 
        ? batch.createdAt.toISOString() 
        : new Date(batch.createdAt).toISOString();
      
      console.log('Formatted createdAt:', createdAt);
      
      // Prepare batch data for database
      const batchData = {
        id: batch.id,
        name: batch.name,
        platform: batch.platform || 'unknown',
        description: batch.description || '',
        status: batch.status || 'pending',
        settings: batch.settings || {},
        created_at: createdAt,
        created_by: user?.id || null
      };
      
      console.log('Prepared batch data for database:', batchData);
      
      // Save batch to Supabase with upsert to handle existing records
      const { data: batchResult, error: batchError } = await supabase
        .from('batches')
        .upsert(batchData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error saving batch:', batchError);
        throw new Error(`Database error: ${batchError.message}`);
      }
      
      console.log('Batch saved successfully:', batchResult);

      // Save prompts to Supabase
      if (batch.prompts && batch.prompts.length > 0) {
        console.log(`Saving ${batch.prompts.length} prompts for batch ${batch.id}`);
        
        for (const prompt of batch.prompts) {
          const promptData = {
            id: prompt.id,
            batch_id: batch.id,
            prompt_text: prompt.text,
            order_index: prompt.order,
            status: 'pending'
          };
          
          console.log('Saving prompt:', promptData);
          
          const { data: promptResult, error: promptError } = await supabase
            .from('prompts')
            .upsert(promptData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          if (promptError) {
            console.error('Error saving prompt:', promptError);
            throw new Error(`Prompt save error: ${promptError.message}`);
          }
          
          console.log('Prompt saved successfully:', promptResult);
        }
      }

      console.log('All batch data saved to database successfully');
      return true;
    } catch (error) {
      console.error('Failed to save batch to database:', error);
      toast({
        title: "Database save failed",
        description: error instanceof Error ? error.message : 'Unknown database error',
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyBatchInDatabase = async (batchId: string) => {
    try {
      console.log('Verifying batch exists in database:', batchId);
      
      const { data: existingBatch, error: checkError } = await supabase
        .from('batches')
        .select('id, name, status, platform')
        .eq('id', batchId)
        .single();
        
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('Batch not found in database:', batchId);
          return null;
        }
        console.error('Error checking batch existence:', checkError);
        throw checkError;
      }
      
      console.log('Batch verified in database:', existingBatch);
      return existingBatch;
    } catch (error) {
      console.error('Could not verify batch in database:', error);
      return null;
    }
  };

  return {
    saveBatchToDatabase,
    verifyBatchInDatabase
  };
};
