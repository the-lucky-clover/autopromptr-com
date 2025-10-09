
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { authRateLimiter } from '@/services/security/rateLimiter';
import { useToast } from './use-toast';

export const useSecureAuth = () => {
  const auth = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  // Log security events to the database
  const logSecurityEvent = async (eventType: string, eventData?: any) => {
    try {
      await supabase.from('security_events').insert({
        user_id: auth.user?.id || null,
        event_type: eventType,
        event_data: eventData,
        ip_address: null, // Could be enhanced to capture real IP
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(email)) {
      await logSecurityEvent('rate_limit_exceeded', { email, action: 'sign_in' });
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    // Input validation
    if (!email || !password) {
      await logSecurityEvent('invalid_input', { email, action: 'sign_in', error: 'missing_credentials' });
      return { error: new Error('Email and password are required') };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logSecurityEvent('invalid_input', { email, action: 'sign_in', error: 'invalid_email_format' });
      return { error: new Error('Invalid email format') };
    }

    try {
      // Clear any existing auth state before signing in
      await supabase.auth.signOut();
      
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        await logSecurityEvent('sign_in_failed', { email, error: result.error.message });
        console.error('Secure sign-in error:', result.error);
      } else {
        await logSecurityEvent('sign_in_success', { email });
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent('sign_in_error', { email, error: error instanceof Error ? error.message : 'unknown' });
      console.error('Secure sign-in failed:', error);
      return { error: error instanceof Error ? error : new Error('Sign-in failed') };
    }
  };

  const secureSignUp = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(email)) {
      await logSecurityEvent('rate_limit_exceeded', { email, action: 'sign_up' });
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    // Input validation
    if (!email || !password) {
      await logSecurityEvent('invalid_input', { email, action: 'sign_up', error: 'missing_credentials' });
      return { error: new Error('Email and password are required') };
    }

    // Enhanced password strength validation
    if (password.length < 12) {
      await logSecurityEvent('invalid_input', { email, action: 'sign_up', error: 'weak_password' });
      return { error: new Error('Password must be at least 12 characters long') };
    }

    try {
      const result = await auth.signUp(email, password);
      
      if (result.error) {
        await logSecurityEvent('sign_up_failed', { email, error: result.error.message });
        console.error('Secure sign-up error:', result.error);
      } else {
        await logSecurityEvent('sign_up_success', { email });
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent('sign_up_error', { email, error: error instanceof Error ? error.message : 'unknown' });
      console.error('Secure sign-up failed:', error);
      return { error: error instanceof Error ? error : new Error('Sign-up failed') };
    }
  };

  const secureSignOut = async () => {
    try {
      await logSecurityEvent('sign_out_initiated', { user_id: auth.user?.id });
      
      // Aggressive cleanup - clear ALL localStorage except safe UI preferences
      const safeKeys = ['theme', 'language', 'cookie-consent', 'clock-settings'];
      Object.keys(localStorage).forEach(key => {
        if (!safeKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Also clear sessionStorage
      sessionStorage.clear();
      
      await auth.signOut();
      await logSecurityEvent('sign_out_success', { user_id: auth.user?.id });
    } catch (error) {
      await logSecurityEvent('sign_out_error', { 
        user_id: auth.user?.id, 
        error: error instanceof Error ? error.message : 'unknown' 
      });
      console.error('Secure sign-out failed:', error);
    }
  };

  // Permission checking utilities using database roles
  const hasPermission = async (requiredRole: 'user' | 'admin' | 'sysop'): Promise<boolean> => {
    if (!auth.user) return false;
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: auth.user.id,
        _role: requiredRole
      });
      
      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  };

  const requireAuth = (): boolean => {
    const isAuthenticated = !!auth.user && auth.isEmailVerified;
    if (!isAuthenticated) {
      logSecurityEvent('unauthorized_access_attempt', { 
        user_id: auth.user?.id,
        email_verified: auth.isEmailVerified 
      });
    }
    return isAuthenticated;
  };

  const requireRole = async (requiredRole: 'admin' | 'sysop'): Promise<boolean> => {
    const isAuthorized = requireAuth() && await hasPermission(requiredRole);
    if (!isAuthorized) {
      await logSecurityEvent('insufficient_permissions', { 
        user_id: auth.user?.id,
        required_role: requiredRole,
        current_role: role 
      });
    }
    return isAuthorized;
  };

  return {
    ...auth,
    role,
    isAdmin,
    roleLoading,
    secureSignIn,
    secureSignUp,
    secureSignOut,
    hasPermission,
    requireAuth,
    requireRole,
    logSecurityEvent
  };
};
