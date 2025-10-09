-- CRITICAL SECURITY FIX: Complete policy migration

-- Step 1: Update ALL dependent RLS policies
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
ON newsletter_subscribers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Sysops and admins can view system logs" ON render_syslog;
CREATE POLICY "Sysops and admins can view system logs"
ON render_syslog FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Super users can manage user privileges" ON profiles;
CREATE POLICY "Admins can manage user privileges"
ON profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 2: Migrate roles to user_roles
INSERT INTO user_roles (user_id, role, created_by)
SELECT 
  id, 
  CASE 
    WHEN is_super_user = true THEN 'admin'::app_role
    WHEN role = 'admin' THEN 'admin'::app_role
    ELSE 'user'::app_role
  END,
  id
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Update functions
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_role text;
BEGIN
  SELECT role::text INTO user_role FROM public.user_roles
  WHERE user_id = _user_id ORDER BY CASE WHEN role = 'admin' THEN 1 ELSE 2 END LIMIT 1;
  RETURN COALESCE(user_role, 'user');
END; $$;

DROP FUNCTION IF EXISTS public.set_super_user(uuid, boolean);

CREATE OR REPLACE FUNCTION public.set_user_role(_user_id uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Only admins can modify user roles';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role, created_by) VALUES (_user_id, _role, auth.uid());
END; $$;

-- Step 4: Drop columns
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_super_user;

-- Step 5: Fix blog_posts policy
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
CREATE POLICY "Only admins and authors can manage blog posts" ON blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR author_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR author_id = auth.uid());

-- Step 6: Create telemetry table
CREATE TABLE IF NOT EXISTS telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  batch_id uuid,
  platform text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own telemetry" ON telemetry_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System insert telemetry" ON telemetry_events FOR INSERT WITH CHECK (true);