
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Create the get_user_role function with the correct parameter name
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = _user_id;
  
  -- Return 'user' as default if no role found
  RETURN COALESCE(user_role, 'user');
END;
$$;
