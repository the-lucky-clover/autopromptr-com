-- Phase 1: Fix Critical Email Exposure
-- Remove public read access from newsletter_subscribers
DROP POLICY IF EXISTS "Allow public read access to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to subscribe" ON newsletter_subscribers;

-- Create secure policies for newsletter_subscribers
CREATE POLICY "Admins can view newsletter subscribers"
ON newsletter_subscribers
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_super_user = true OR role = 'admin'
  )
);

CREATE POLICY "Public can subscribe to newsletter"
ON newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Phase 2: Secure System Logs Access
-- Remove public read policy from render_syslog
DROP POLICY IF EXISTS "Users can view render syslog entries" ON render_syslog;

-- Create secure policies for render_syslog
CREATE POLICY "Sysops and admins can view system logs"
ON render_syslog
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_super_user = true OR role IN ('admin', 'sysop')
  )
);

-- Phase 3: Fix Database Function Security
-- Update functions with proper search_path protection
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = role_name
    AND pg_has_role(current_user, oid, 'member')
  );
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
    DELETE FROM automation_logs
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    DELETE FROM render_syslog
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_batch_stats()
RETURNS TABLE(
    total_batches bigint,
    active_batches bigint,
    completed_batches bigint,
    failed_batches bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_batches,
        COUNT(*) FILTER (WHERE status = 'processing') as active_batches,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_batches,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_batches
    FROM batches
    WHERE created_by = auth.uid();
END;
$$;

-- Add security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type text,
    event_data jsonb DEFAULT NULL,
    user_id_param uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
    INSERT INTO security_events (
        user_id,
        event_type,
        event_data,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        COALESCE(user_id_param, auth.uid()),
        event_type,
        event_data,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent',
        now()
    );
END;
$$;