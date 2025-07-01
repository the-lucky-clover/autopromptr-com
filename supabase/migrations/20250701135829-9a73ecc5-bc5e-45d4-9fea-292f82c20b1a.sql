
-- Extend the automation_logs table to capture detailed metrics
ALTER TABLE automation_logs 
ADD COLUMN IF NOT EXISTS prompt_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_saved_seconds INTEGER,
ADD COLUMN IF NOT EXISTS target_url TEXT,
ADD COLUMN IF NOT EXISTS ai_assistant_type TEXT,
ADD COLUMN IF NOT EXISTS success_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS prompt_text TEXT,
ADD COLUMN IF NOT EXISTS response_text TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create productivity_metrics table for aggregated statistics
CREATE TABLE IF NOT EXISTS public.productivity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_prompts_processed INTEGER DEFAULT 0,
  total_time_saved_seconds INTEGER DEFAULT 0,
  successful_prompts INTEGER DEFAULT 0,
  failed_prompts INTEGER DEFAULT 0,
  platforms_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on productivity_metrics
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for productivity_metrics
CREATE POLICY "Users can view their own productivity metrics" 
  ON public.productivity_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity metrics" 
  ON public.productivity_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity metrics" 
  ON public.productivity_metrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own productivity metrics" 
  ON public.productivity_metrics 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update existing RLS policies for automation_logs to include user_id check
DROP POLICY IF EXISTS "Users can view logs for their batches" ON automation_logs;
DROP POLICY IF EXISTS "Users can view logs from their batches" ON automation_logs;

CREATE POLICY "Users can view their own automation logs" 
  ON public.automation_logs 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (batch_id IS NOT NULL AND batch_id IN (
      SELECT batches.id FROM batches WHERE batches.created_by = auth.uid()
    ))
  );

CREATE POLICY "Users can delete their own automation logs" 
  ON public.automation_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update productivity metrics
CREATE OR REPLACE FUNCTION update_productivity_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed automation logs
  IF NEW.success_status IN ('completed', 'failed') AND NEW.user_id IS NOT NULL THEN
    INSERT INTO productivity_metrics (
      user_id, 
      date, 
      total_prompts_processed,
      total_time_saved_seconds,
      successful_prompts,
      failed_prompts,
      platforms_used
    )
    VALUES (
      NEW.user_id,
      CURRENT_DATE,
      1,
      COALESCE(NEW.time_saved_seconds, 0),
      CASE WHEN NEW.success_status = 'completed' THEN 1 ELSE 0 END,
      CASE WHEN NEW.success_status = 'failed' THEN 1 ELSE 0 END,
      CASE WHEN NEW.ai_assistant_type IS NOT NULL 
           THEN jsonb_build_array(NEW.ai_assistant_type) 
           ELSE '[]'::jsonb 
      END
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      total_prompts_processed = productivity_metrics.total_prompts_processed + 1,
      total_time_saved_seconds = productivity_metrics.total_time_saved_seconds + COALESCE(NEW.time_saved_seconds, 0),
      successful_prompts = productivity_metrics.successful_prompts + 
        CASE WHEN NEW.success_status = 'completed' THEN 1 ELSE 0 END,
      failed_prompts = productivity_metrics.failed_prompts + 
        CASE WHEN NEW.success_status = 'failed' THEN 1 ELSE 0 END,
      platforms_used = CASE 
        WHEN NEW.ai_assistant_type IS NOT NULL AND NOT (productivity_metrics.platforms_used ? NEW.ai_assistant_type)
        THEN productivity_metrics.platforms_used || jsonb_build_array(NEW.ai_assistant_type)
        ELSE productivity_metrics.platforms_used
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update productivity metrics
DROP TRIGGER IF EXISTS update_productivity_metrics_trigger ON automation_logs;
CREATE TRIGGER update_productivity_metrics_trigger
  AFTER INSERT OR UPDATE ON automation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_productivity_metrics();
