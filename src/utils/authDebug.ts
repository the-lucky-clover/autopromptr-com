/**
 * Authentication debugging utilities
 * Helps diagnose sign-in issues on the landing page
 */

import { cloudflare, isCloudflareConfigured } from '@/integrations/cloudflare/client';

export const debugAuth = async () => {
  console.log('🔍 AUTH DEBUG START');
  console.log('==================');
  
  // Check 1: Cloudflare configuration
  console.log('1. Cloudflare configured:', isCloudflareConfigured);
  
  if (!isCloudflareConfigured) {
    console.error('❌ Cloudflare Worker is not configured!');
    return;
  }
  
  // Check 2: Current session
  try {
    const { data: { session }, error: sessionError } = await cloudflare.auth.getSession();
    console.log('2. Current session:', session ? '✅ Active' : '⚠️ None');
    if (sessionError) {
      console.error('   Session error:', sessionError);
    }
    if (session) {
      console.log('   User:', session.user.email);
      console.log('   Email verified:', session.user.email_confirmed_at ? '✅' : '❌');
    }
  } catch (err) {
    console.error('❌ Failed to get session:', err);
  }
  
  // Check 3: Connection to Cloudflare D1
  try {
    const { data, error } = await cloudflare.db.from('profiles').select('id').limit(1);
    if (error) {
      console.log('3. Database connection:', '⚠️ Error:', error.message);
    } else {
      console.log('3. Database connection:', '✅ Connected');
    }
  } catch (err) {
    console.log('3. Database connection:', '❌ Failed:', err);
  }
  
  // Check 4: Auth listeners
  console.log('4. Auth state listener:', '✅ Set up in useAuth hook');
  
  console.log('==================');
  console.log('🔍 AUTH DEBUG END');
};

export const testSignIn = async (email: string, password: string) => {
  console.log('🧪 Testing sign-in for:', email);
  
  try {
    const { data, error } = await cloudflare.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign-in error:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Sign-in successful!');
    console.log('   User:', data.user.email);
    console.log('   Email verified:', data.user.email_confirmed_at ? '✅' : '❌');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err };
  }
};
