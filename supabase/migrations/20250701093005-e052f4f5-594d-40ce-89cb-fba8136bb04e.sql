
-- Add is_super_user column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_super_user BOOLEAN DEFAULT FALSE;

-- Update the get_user_role function to check is_super_user field
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create a function to promote/demote users to admin status
CREATE OR REPLACE FUNCTION public.set_super_user(_user_id uuid, _is_super boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create RLS policy for super user management
CREATE POLICY "Super users can manage user privileges" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_super_user = true
  )
);
