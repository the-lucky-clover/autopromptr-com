// Cloudflare-specific Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { CLOUDFLARE_CONFIG } from './config';

// Cloudflare Pages compatible Supabase client
export const cloudflareSupabase = createClient<Database>(
  CLOUDFLARE_CONFIG.CF_SUPABASE_URL,
  CLOUDFLARE_CONFIG.CF_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Dual client resolver - returns appropriate client based on environment
export const getSupabaseClient = () => {
  const config = import.meta.env;
  
  // If running on Cloudflare Pages, use Cloudflare-specific config
  if (typeof window !== 'undefined' && window.location.hostname.includes('.pages.dev')) {
    return cloudflareSupabase;
  }
  
  // Otherwise use existing Lovable client
  const { supabase } = require('@/integrations/supabase/client');
  return supabase;
};
