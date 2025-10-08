/**
 * MVP #1 Batch Runner - Frontend integration
 * Connects to Flask backend for smart prompt injection
 */
import { Batch } from '@/types/batch';
import { supabase } from '@/integrations/supabase/client';

interface BatchRunOptions {
  waitForCompletion?: boolean;
  maxRetries?: number;
  onProgress?: (progress: BatchProgress) => void;
}

interface BatchProgress {
  batchId: string;
  status: string;
  currentPrompt: number;
  totalPrompts: number;
  completed: number;
  failed: number;
  progressPercentage: number;
}

interface BatchResult {
  success: boolean;
  batchId: string;
  completed: number;
  failed: number;
  results: any[];
  error?: string;
}

export class MVPBatchRunner {
  private backendUrl: string;
  private pollInterval = 2000; // Poll every 2 seconds
  
  constructor() {
    // Backend URL will be set from environment or Supabase secret
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://autopromptr-backend.onrender.com';
  }
  
  async getBackendUrl(): Promise<string> {
    // Try to get from Supabase secrets first
    try {
      const { data } = await supabase.functions.invoke('get-backend-url');
      if (data?.url) {
        return data.url;
      }
    } catch (e) {
      console.warn('Could not fetch backend URL from Supabase, using default');
    }
    
    return this.backendUrl;
  }
  
  /**
   * THE MAIN MVP #1 FUNCTION
   * Runs a batch of prompts with smart waiting
   */
  async runBatch(batch: Batch, options: BatchRunOptions = {}): Promise<BatchResult> {
    const {
      waitForCompletion = true,
      maxRetries = 3,
      onProgress
    } = options;
    
    console.log('🚀 Starting MVP #1 batch run:', batch.id);
    console.log('📊 Target URL:', batch.targetUrl);
    console.log('📝 Total prompts:', batch.prompts?.length || 0);
    console.log('⏳ Wait for completion:', waitForCompletion);
    
    try {
      const backendUrl = await this.getBackendUrl();
      
      // Prepare prompts
      const prompts = (batch.prompts || []).map((p, index) => ({
        id: p.id || `prompt_${index}`,
        text: p.text
      }));
      
      // Start batch processing on backend
      const response = await fetch(`${backendUrl}/api/automation/process-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_id: batch.id,
          target_url: batch.targetUrl,
          prompts,
          options: {
            wait_for_completion: waitForCompletion,
            max_retries: maxRetries
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Backend request failed');
      }
      
      // Start polling for status updates
      if (onProgress) {
        this.startStatusPolling(batch.id, onProgress);
      }
      
      // Wait for final result
      const result = await response.json();
      
      console.log('✅ Batch completed:', result);
      
      // Update Supabase batch status
      await this.updateBatchInSupabase(batch.id, result);
      
      return {
        success: result.status === 'completed',
        batchId: result.batch_id,
        completed: result.completed || 0,
        failed: result.failed || 0,
        results: result.results || [],
        error: result.error
      };
      
    } catch (error) {
      console.error('❌ Batch run failed:', error);
      
      return {
        success: false,
        batchId: batch.id,
        completed: 0,
        failed: batch.prompts?.length || 0,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private async startStatusPolling(
    batchId: string,
    onProgress: (progress: BatchProgress) => void
  ): Promise<void> {
    const backendUrl = await this.getBackendUrl();
    
    const poll = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/automation/batch-status/${batchId}`);
        
        if (response.ok) {
          const status = await response.json();
          
          onProgress({
            batchId,
            status: status.status,
            currentPrompt: status.current_prompt_index + 1,
            totalPrompts: status.total_prompts,
            completed: status.completed,
            failed: status.failed,
            progressPercentage: (status.completed + status.failed) / status.total_prompts * 100
          });
          
          // Continue polling if still processing
          if (status.status === 'processing') {
            setTimeout(poll, this.pollInterval);
          }
        }
      } catch (e) {
        console.error('Error polling batch status:', e);
      }
    };
    
    poll();
  }
  
  private async updateBatchInSupabase(batchId: string, result: any): Promise<void> {
    try {
      const status = result.status === 'completed' ? 'completed' : 
                     result.status === 'failed' ? 'failed' : 'processing';
      
      await supabase
        .from('batches')
        .update({
          status,
          completed_at: result.completed_at || new Date().toISOString()
        })
        .eq('id', batchId);
      
      // Update individual prompts
      if (result.results) {
        for (const promptResult of result.results) {
          await supabase
            .from('prompts')
            .update({
              status: promptResult.status,
              result: promptResult.result,
              error_message: promptResult.error,
              processed_at: new Date().toISOString()
            })
            .eq('id', promptResult.prompt_id);
        }
      }
    } catch (e) {
      console.error('Error updating Supabase:', e);
    }
  }
  
  async stopBatch(batchId: string): Promise<boolean> {
    try {
      const backendUrl = await this.getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/automation/stop-batch/${batchId}`, {
        method: 'POST'
      });
      
      return response.ok;
    } catch (e) {
      console.error('Error stopping batch:', e);
      return false;
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const backendUrl = await this.getBackendUrl();
      const response = await fetch(`${backendUrl}/health`);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

export const mvpBatchRunner = new MVPBatchRunner();
