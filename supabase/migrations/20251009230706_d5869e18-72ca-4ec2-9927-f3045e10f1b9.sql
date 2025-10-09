-- Create prompt_library table for storing user prompts with auto-save and analytics
CREATE TABLE public.prompt_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_text TEXT NOT NULL,
  title TEXT,
  target_platform TEXT, -- 'suno', 'udio', 'elevenlabs', 'lovable', 'v0', 'cursor', 'windsurf', etc.
  target_url TEXT,
  category TEXT, -- 'music', 'code', 'design', 'game', 'research', etc.
  tags TEXT[], -- searchable tags
  is_favorite BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  time_saved_seconds INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual', -- 'manual', 'batch_automation', 'duplicated'
  source_batch_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb, -- analytics, telemetry, results, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_library
CREATE POLICY "Users can view their own prompts"
  ON public.prompt_library
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts"
  ON public.prompt_library
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON public.prompt_library
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON public.prompt_library
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better search performance
CREATE INDEX idx_prompt_library_user_id ON public.prompt_library(user_id);
CREATE INDEX idx_prompt_library_platform ON public.prompt_library(target_platform);
CREATE INDEX idx_prompt_library_category ON public.prompt_library(category);
CREATE INDEX idx_prompt_library_created_at ON public.prompt_library(created_at DESC);
CREATE INDEX idx_prompt_library_tags ON public.prompt_library USING GIN(tags);
CREATE INDEX idx_prompt_library_search ON public.prompt_library USING gin(to_tsvector('english', prompt_text || ' ' || COALESCE(title, '')));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_prompt_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompt_library_updated_at
  BEFORE UPDATE ON public.prompt_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prompt_library_updated_at();

-- Function to auto-save prompts from batch automation
CREATE OR REPLACE FUNCTION public.save_batch_prompts_to_library()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER save_batch_prompts_to_library_trigger
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.save_batch_prompts_to_library();