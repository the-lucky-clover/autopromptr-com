import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromptLibraryItem {
  id: string;
  user_id: string;
  prompt_text: string;
  title: string | null;
  target_platform: string | null;
  target_url: string | null;
  category: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  times_used: number;
  last_used_at: string | null;
  time_saved_seconds: number;
  source: string;
  source_batch_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('prompt_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`prompt_text.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      if (filterPlatform) {
        query = query.eq('target_platform', filterPlatform);
      }

      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      if (showFavoritesOnly) {
        query = query.eq('is_favorite', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Error loading prompts',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterPlatform, filterCategory, showFavoritesOnly, toast]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const savePrompt = async (promptData: Partial<PromptLibraryItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prompt_library')
        .insert([{
          user_id: user.id,
          prompt_text: promptData.prompt_text || '',
          title: promptData.title,
          target_platform: promptData.target_platform,
          target_url: promptData.target_url,
          category: promptData.category,
          tags: promptData.tags,
          is_favorite: promptData.is_favorite,
          source: promptData.source || 'manual',
          metadata: promptData.metadata || {},
        }])
        .select()
        .single();

      if (error) throw error;

      setPrompts(prev => [data, ...prev]);
      toast({ title: 'Prompt saved', description: 'Added to your library' });
      return data;
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error saving prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePrompt = async (id: string, updates: Partial<PromptLibraryItem>) => {
    try {
      const { data, error } = await supabase
        .from('prompt_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPrompts(prev => prev.map(p => p.id === id ? data : p));
      toast({ title: 'Prompt updated' });
      return data;
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: 'Error updating prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prompt_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrompts(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Prompt deleted' });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Error deleting prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const duplicatePrompt = async (id: string) => {
    try {
      const prompt = prompts.find(p => p.id === id);
      if (!prompt) throw new Error('Prompt not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prompt_library')
        .insert({
          user_id: user.id,
          prompt_text: prompt.prompt_text,
          title: prompt.title ? `${prompt.title} (Copy)` : null,
          target_platform: prompt.target_platform,
          target_url: prompt.target_url,
          category: prompt.category,
          tags: prompt.tags,
          source: 'duplicated',
          metadata: { ...prompt.metadata, duplicated_from: id },
        })
        .select()
        .single();

      if (error) throw error;

      setPrompts(prev => [data, ...prev]);
      toast({ title: 'Prompt duplicated' });
      return data;
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      toast({
        title: 'Error duplicating prompt',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    await updatePrompt(id, { is_favorite: !prompt.is_favorite });
  };

  const incrementUsage = async (id: string, timeSaved: number = 0) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    await updatePrompt(id, {
      times_used: prompt.times_used + 1,
      last_used_at: new Date().toISOString(),
      time_saved_seconds: prompt.time_saved_seconds + timeSaved,
    });
  };

  return {
    prompts,
    loading,
    searchQuery,
    setSearchQuery,
    filterPlatform,
    setFilterPlatform,
    filterCategory,
    setFilterCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    savePrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    incrementUsage,
    refetch: fetchPrompts,
  };
}
