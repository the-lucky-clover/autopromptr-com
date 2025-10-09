-- Fix search_path for prompt library functions
DROP FUNCTION IF EXISTS public.update_prompt_library_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.save_batch_prompts_to_library() CASCADE;

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.update_prompt_library_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prompt_library_updated_at
  BEFORE UPDATE ON public.prompt_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prompt_library_updated_at();

-- Function to auto-save prompts from batch automation
CREATE OR REPLACE FUNCTION public.save_batch_prompts_to_library()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a batch completes, save all prompts to library
  IF NEW.status IN ('completed', 'completed_with_errors') AND OLD.status = 'processing' THEN
    INSERT INTO public.prompt_library (
      user_id,
      prompt_text,
      title,
      target_platform,
      target_url,
      source,
      source_batch_id,
      times_used,
      metadata
    )
    SELECT 
      NEW.created_by,
      p.prompt_text,
      NEW.name || ' - Prompt ' || p.order_index,
      NEW.platform,
      (NEW.settings->>'targetUrlOverride')::text,
      'batch_automation',
      NEW.id,
      1,
      jsonb_build_object(
        'batch_name', NEW.name,
        'batch_id', NEW.id,
        'completed_at', NEW.completed_at,
        'status', p.status,
        'processing_time_ms', p.processing_time_ms
      )
    FROM public.prompts p
    WHERE p.batch_id = NEW.id
      AND p.status = 'completed'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER save_batch_prompts_to_library_trigger
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.save_batch_prompts_to_library();