-- Fix remaining database functions that need search_path protection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  user_role text;
  is_super boolean;
BEGIN
  SELECT role, is_super_user 
  INTO user_role, is_super
  FROM public.profiles
  WHERE id = _user_id;
  
  -- Return 'sysop' if user is super user, otherwise return their role or 'user' as default
  IF is_super = true THEN
    RETURN 'sysop';
  ELSE
    RETURN COALESCE(user_role, 'user');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_super_user(_user_id uuid, _is_super boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  -- Only allow existing super users to promote/demote other users
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_user = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Only super users can modify user privileges';
  END IF;
  
  UPDATE public.profiles
  SET is_super_user = _is_super,
      updated_at = now()
  WHERE id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_batch_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
    batch_uuid UUID;
    total_prompts INTEGER;
    completed_prompts INTEGER;
    failed_prompts INTEGER;
BEGIN
    batch_uuid := COALESCE(NEW.batch_id, OLD.batch_id);
    
    SELECT COUNT(*), 
           COUNT(*) FILTER (WHERE status = 'completed'),
           COUNT(*) FILTER (WHERE status = 'failed')
    INTO total_prompts, completed_prompts, failed_prompts
    FROM prompts 
    WHERE batch_id = batch_uuid;
    
    -- If all prompts are completed or failed, update batch status
    IF completed_prompts + failed_prompts = total_prompts AND total_prompts > 0 THEN
        UPDATE batches 
        SET status = CASE 
            WHEN failed_prompts = 0 THEN 'completed'
            WHEN completed_prompts = 0 THEN 'failed'
            ELSE 'completed_with_errors'
        END,
        completed_at = NOW()
        WHERE id = batch_uuid AND status = 'processing';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_productivity_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
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
$$;