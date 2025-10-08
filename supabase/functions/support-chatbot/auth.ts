import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthResult {
  user: any;
  hasRole: (role: string) => Promise<boolean>;
}

export async function validateAuth(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const hasRole = async (role: string) => {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: role
    });
    
    return !error && data === true;
  };

  return { user, hasRole };
}
