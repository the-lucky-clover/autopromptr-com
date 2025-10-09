import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AutoSaveOptions {
  promptText: string;
  title?: string;
  targetPlatform?: string;
  targetUrl?: string;
  category?: string;
  tags?: string[];
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSavePrompt({
  promptText,
  title,
  targetPlatform,
  targetUrl,
  category,
  tags,
  debounceMs = 2000,
  enabled = true,
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const draftIdRef = useRef<string | null>(null);

  const saveDraft = useCallback(async () => {
    if (!enabled || !promptText.trim() || promptText === lastSavedRef.current) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const draftData = {
        user_id: user.id,
        prompt_text: promptText,
        title: title || 'Untitled Draft',
        target_platform: targetPlatform,
        target_url: targetUrl,
        category: category || 'draft',
        tags: tags || ['auto-saved'],
        source: 'manual',
        metadata: {
          auto_saved: true,
          last_auto_save: new Date().toISOString(),
        },
      };

      if (draftIdRef.current) {
        // Update existing draft
        const { error } = await supabase
          .from('prompt_library')
          .update(draftData)
          .eq('id', draftIdRef.current);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('prompt_library')
          .insert(draftData)
          .select()
          .single();

        if (error) throw error;
        if (data) draftIdRef.current = data.id;
      }

      lastSavedRef.current = promptText;
      console.log('✅ Draft auto-saved');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [promptText, title, targetPlatform, targetUrl, category, tags, enabled]);

  useEffect(() => {
    if (!enabled || !promptText.trim()) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [promptText, saveDraft, debounceMs, enabled]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  const clearDraft = useCallback(async () => {
    if (draftIdRef.current) {
      try {
        await supabase
          .from('prompt_library')
          .delete()
          .eq('id', draftIdRef.current);
        
        draftIdRef.current = null;
        lastSavedRef.current = '';
      } catch (error) {
        console.error('Error clearing draft:', error);
      }
    }
  }, []);

  return {
    forceSave,
    clearDraft,
    draftId: draftIdRef.current,
    lastSaved: lastSavedRef.current,
  };
}
