
-- Phase 1: Critical RLS Policy Implementation (Fixed version)
-- Enable RLS on all unprotected tables and add comprehensive policies

-- 1. Enable RLS on newsletter_subscribers table (if not already enabled)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Allow public read access to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to subscribe" ON public.newsletter_subscribers;

-- Allow public read access to newsletter subscribers (for admin purposes)
-- But restrict insert/update/delete to authenticated users only
CREATE POLICY "Allow public read access to newsletter" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to subscribe" 
ON public.newsletter_subscribers 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Enable RLS on automation_logs table (if not already enabled)
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view logs for their batches" ON public.automation_logs;
DROP POLICY IF EXISTS "System can insert automation logs" ON public.automation_logs;

-- Only authenticated users can view logs, and only their own batch logs
CREATE POLICY "Users can view logs for their batches" 
ON public.automation_logs 
FOR SELECT 
TO authenticated 
USING (
  batch_id IS NULL OR 
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
);

-- Only system can insert logs (via service role)
CREATE POLICY "System can insert automation logs" 
ON public.automation_logs 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- 3. Enable RLS on user_verification_status table (if not already enabled)
ALTER TABLE public.user_verification_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own verification status" ON public.user_verification_status;
DROP POLICY IF EXISTS "System can manage verification status" ON public.user_verification_status;

-- Users can only see their own verification status
CREATE POLICY "Users can view their own verification status" 
ON public.user_verification_status 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- System can insert/update verification status
CREATE POLICY "System can manage verification status" 
ON public.user_verification_status 
FOR ALL 
TO service_role 
WITH CHECK (true);

-- 4. Enable RLS on platform_sessions table (if not already enabled)
ALTER TABLE public.platform_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own platform sessions" ON public.platform_sessions;
DROP POLICY IF EXISTS "Users can create their own platform sessions" ON public.platform_sessions;
DROP POLICY IF EXISTS "Users can update their own platform sessions" ON public.platform_sessions;
DROP POLICY IF EXISTS "Users can delete their own platform sessions" ON public.platform_sessions;

-- Users can only see their own platform sessions
CREATE POLICY "Users can view their own platform sessions" 
ON public.platform_sessions 
FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

-- Users can create their own platform sessions
CREATE POLICY "Users can create their own platform sessions" 
ON public.platform_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Users can update their own platform sessions
CREATE POLICY "Users can update their own platform sessions" 
ON public.platform_sessions 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid());

-- Users can delete their own platform sessions
CREATE POLICY "Users can delete their own platform sessions" 
ON public.platform_sessions 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- 5. Strengthen existing batch policies
-- Drop existing policies if they exist and recreate with better security
DROP POLICY IF EXISTS "Users can view their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can create batches" ON public.batches;
DROP POLICY IF EXISTS "Users can update their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can delete their own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can create their own batches" ON public.batches;

-- Enhanced batch policies
CREATE POLICY "Users can view their own batches" 
ON public.batches 
FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own batches" 
ON public.batches 
FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own batches" 
ON public.batches 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own batches" 
ON public.batches 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- 6. Strengthen existing prompt policies
-- Drop existing policies if they exist and recreate with better security
DROP POLICY IF EXISTS "Users can view prompts for their batches" ON public.prompts;
DROP POLICY IF EXISTS "Users can create prompts for their batches" ON public.prompts;
DROP POLICY IF EXISTS "Users can update prompts for their batches" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete prompts for their batches" ON public.prompts;

-- Enhanced prompt policies
CREATE POLICY "Users can view prompts for their batches" 
ON public.prompts 
FOR SELECT 
TO authenticated 
USING (
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can create prompts for their batches" 
ON public.prompts 
FOR INSERT 
TO authenticated 
WITH CHECK (
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update prompts for their batches" 
ON public.prompts 
FOR UPDATE 
TO authenticated 
USING (
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete prompts for their batches" 
ON public.prompts 
FOR DELETE 
TO authenticated 
USING (
  batch_id IN (
    SELECT id FROM public.batches WHERE created_by = auth.uid()
  )
);

-- 7. Create user roles system for proper authorization
-- Create enum for roles (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'sysop');
    END IF;
END
$$;

-- Create user_roles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'sysop' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'user' THEN 3 
    END
  LIMIT 1
$$;

-- Drop existing user_roles policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Sysops can manage all roles" ON public.user_roles;

-- User roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Only sysops can manage roles
CREATE POLICY "Sysops can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'sysop'))
WITH CHECK (public.has_role(auth.uid(), 'sysop'));

-- Insert default sysop role for the god account
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT id, 'sysop', id
FROM auth.users 
WHERE email = 'pounds1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Add admin policies for enhanced access
-- Drop existing admin policies if they exist and recreate
DROP POLICY IF EXISTS "Sysops can view all batches" ON public.batches;
DROP POLICY IF EXISTS "Sysops can view all prompts" ON public.prompts;
DROP POLICY IF EXISTS "Sysops can view all automation logs" ON public.automation_logs;

-- Allow sysops to view all batches
CREATE POLICY "Sysops can view all batches" 
ON public.batches 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'sysop'));

-- Allow sysops to view all prompts
CREATE POLICY "Sysops can view all prompts" 
ON public.prompts 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'sysop'));

-- Allow sysops to view all automation logs
CREATE POLICY "Sysops can view all automation logs" 
ON public.automation_logs 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'sysop'));
