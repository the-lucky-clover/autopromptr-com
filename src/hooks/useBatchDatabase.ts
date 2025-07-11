
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';
import { supabase } from '@/integrations/supabase/client';

export const useBatchDatabase = () => {
  const { toast } = useToast();

  const saveBatchToDatabase = async (batch: Batch): Promise<boolean> => {
    try {
      console.log('Starting enhanced database save for batch:', batch.id);
      console.log('Enhanced batch data to save:', JSON.stringify(batch, null, 2));
      
      // Get current user with timeout
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Enhanced auth error:', authError);
      }
      
      if (!user) {
        console.log('No authenticated user, but continuing with enhanced save attempt');
      }
      
      // Ensure createdAt is properly formatted
      const createdAt = batch.createdAt instanceof Date 
        ? batch.createdAt.toISOString() 
        : new Date(batch.createdAt).toISOString();
      
      console.log('Enhanced formatted createdAt:', createdAt);
      
      // Prepare enhanced batch data for database
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
      
      console.log('Enhanced prepared batch data for database:', batchData);
      
      // Enhanced batch save with transaction-like approach
      const { data: batchResult, error: batchError } = await supabase
        .from('batches')
        .upsert(batchData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (batchError) {
        console.error('Enhanced error saving batch:', batchError);
        throw new Error(`Enhanced database error: ${batchError.message} (Code: ${batchError.code})`);
      }
      
      console.log('Enhanced batch saved successfully:', batchResult);

      // Enhanced prompts save with better error handling
      if (batch.prompts && batch.prompts.length > 0) {
        console.log(`Enhanced saving ${batch.prompts.length} prompts for batch ${batch.id}`);
        
        // Save prompts in smaller batches to avoid timeouts
        const promptBatchSize = 5;
        for (let i = 0; i < batch.prompts.length; i += promptBatchSize) {
          const promptBatch = batch.prompts.slice(i, i + promptBatchSize);
          
          for (const prompt of promptBatch) {
            const promptData = {
              id: prompt.id,
              batch_id: batch.id,
              prompt_text: prompt.text,
              order_index: prompt.order,
              status: 'pending'
            };
            
            console.log('Enhanced saving prompt:', promptData);
            
            const { data: promptResult, error: promptError } = await supabase
              .from('prompts')
              .upsert(promptData, { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })
              .select()
              .single();

            if (promptError) {
              console.error('Enhanced error saving prompt:', promptError);
              throw new Error(`Enhanced prompt save error: ${promptError.message} (Code: ${promptError.code})`);
            }
            
            console.log('Enhanced prompt saved successfully:', promptResult);
          }
          
          // Small delay between batches to avoid overwhelming the database
          if (i + promptBatchSize < batch.prompts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      console.log('Enhanced: All batch data saved to database successfully');
      return true;
    } catch (error) {
      console.error('Enhanced: Failed to save batch to database:', error);
      
      // Enhanced error categorization
      let errorMessage = 'Unknown database error';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific Supabase error patterns
        if (errorMessage.includes('JWT')) {
          errorMessage = 'Authentication expired. Please refresh the page and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Database operation timed out. Please try again.';
        } else if (errorMessage.includes('connection')) {
          errorMessage = 'Database connection issue. Please check your internet connection.';
        }
      }
      
      toast({
        title: "Enhanced database save failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteBatchFromDatabase = async (batchId: string): Promise<boolean> => {
    try {
      console.log('Deleting batch from database:', batchId);
      
      // First delete associated prompts
      const { error: promptsError } = await supabase
        .from('prompts')
        .delete()
        .eq('batch_id', batchId);

      if (promptsError) {
        console.error('Error deleting prompts:', promptsError);
        throw new Error(`Failed to delete prompts: ${promptsError.message}`);
      }

      // Then delete the batch
      const { error: batchError } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (batchError) {
        console.error('Error deleting batch:', batchError);
        throw new Error(`Failed to delete batch: ${batchError.message}`);
      }

      console.log('Batch deleted successfully from database:', batchId);
      return true;
    } catch (error) {
      console.error('Failed to delete batch from database:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      toast({
        title: "Failed to delete batch",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyBatchInDatabase = async (batchId: string, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Enhanced verifying batch exists in database (attempt ${attempt}):`, batchId);
        
        const { data: existingBatch, error: checkError } = await supabase
          .from('batches')
          .select('id, name, status, platform, created_at')
          .eq('id', batchId)
          .single();
          
        if (checkError) {
          if (checkError.code === 'PGRST116') {
            console.log(`Enhanced: Batch not found in database (attempt ${attempt}):`, batchId);
            
            if (attempt < retries) {
              console.log(`Enhanced: Retrying verification in 1 second...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            return null;
          }
          console.error(`Enhanced error checking batch existence (attempt ${attempt}):`, checkError);
          throw checkError;
        }
        
        console.log(`Enhanced batch verified in database (attempt ${attempt}):`, existingBatch);
        return existingBatch;
      } catch (error) {
        console.error(`Enhanced: Could not verify batch in database (attempt ${attempt}):`, error);
        
        if (attempt < retries) {
          console.log(`Enhanced: Retrying verification in ${attempt} seconds...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        return null;
      }
    }
    
    return null;
  };

  return {
    saveBatchToDatabase,
    deleteBatchFromDatabase,
    verifyBatchInDatabase
  };
};
