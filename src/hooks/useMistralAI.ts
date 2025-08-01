import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MistralRequest {
  type: 'text-inference' | 'web-search' | 'web-scrape' | 'ai-processing';
  prompt: string;
  url?: string;
  searchQuery?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface MistralResponse {
  type: string;
  result?: string;
  analysis?: string;
  searchResults?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  scrapeResult?: {
    title: string;
    content: string;
    url: string;
    metadata: {
      wordCount: number;
      extractedAt: string;
    };
  };
  model: string;
  usage?: any;
  processedAt: string;
}

export function useMistralAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processWithMistral = useCallback(async (request: MistralRequest): Promise<MistralResponse> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🤖 Sending request to Mistral AI processor:', request.type);

      const { data, error: functionError } = await supabase.functions.invoke('mistral-ai-processor', {
        body: request
      });

      if (functionError) {
        throw new Error(`Mistral AI processing failed: ${functionError.message}`);
      }

      if (!data) {
        throw new Error('No response received from Mistral AI processor');
      }

      console.log('✅ Mistral AI processing completed:', data.type);
      
      toast({
        title: 'AI Processing Complete',
        description: `Successfully processed ${request.type} request`,
      });

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      console.error('❌ Mistral AI processing failed:', err);
      
      toast({
        title: 'AI Processing Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const processTextInference = useCallback(async (
    prompt: string, 
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<MistralResponse> => {
    return processWithMistral({
      type: 'text-inference',
      prompt,
      ...options
    });
  }, [processWithMistral]);

  const processWebSearch = useCallback(async (
    searchQuery: string,
    prompt?: string,
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<MistralResponse> => {
    return processWithMistral({
      type: 'web-search',
      searchQuery,
      prompt: prompt || `Search and analyze information about: ${searchQuery}`,
      ...options
    });
  }, [processWithMistral]);

  const processWebScrape = useCallback(async (
    url: string,
    prompt: string,
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<MistralResponse> => {
    return processWithMistral({
      type: 'web-scrape',
      url,
      prompt,
      ...options
    });
  }, [processWithMistral]);

  const processAITask = useCallback(async (
    prompt: string,
    options?: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<MistralResponse> => {
    return processWithMistral({
      type: 'ai-processing',
      prompt,
      ...options
    });
  }, [processWithMistral]);

  return {
    loading,
    error,
    processWithMistral,
    processTextInference,
    processWebSearch,
    processWebScrape,
    processAITask,
    clearError: () => setError(null)
  };
}