
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { authRateLimiter } from '@/services/security/rateLimiter';
import { useToast } from './use-toast';

export const useSecureAuth = () => {
  const auth = useAuth();
  const { role, isSysOp, isAdmin } = useUserRole();
  const { toast } = useToast();

  const secureSignIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(email)) {
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    // Input validation
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: new Error('Invalid email format') };
    }

    try {
      // Clear any existing auth state before signing in
      await supabase.auth.signOut();
      
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        console.error('Secure sign-in error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Secure sign-in failed:', error);
      return { error: error instanceof Error ? error : new Error('Sign-in failed') };
    }
  };

  const secureSignUp = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(email)) {
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return { error: new Error('Rate limit exceeded') };
    }

    // Input validation
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }

    // Password strength validation
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long') };
    }

    try {
      const result = await auth.signUp(email, password);
      
      if (result.error) {
        console.error('Secure sign-up error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Secure sign-up failed:', error);
      return { error: error instanceof Error ? error : new Error('Sign-up failed') };
    }
  };

  const secureSignOut = async () => {
    try {
      // Clear sensitive data from localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('batch') || key.includes('auth') || key.includes('session')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      await auth.signOut();
    } catch (error) {
      console.error('Secure sign-out failed:', error);
    }
  };

  // Permission checking utilities
  const hasPermission = (requiredRole: 'user' | 'admin' | 'sysop'): boolean => {
    if (!auth.user) return false;
    
    const roleHierarchy = { 'user': 0, 'admin': 1, 'sysop': 2 };
    const userLevel = roleHierarchy[role] ?? 0;
    const requiredLevel = roleHierarchy[requiredRole] ?? 0;
    
    return userLevel >= requiredLevel;
  };

  const requireAuth = (): boolean => {
    return !!auth.user && auth.isEmailVerified;
  };

  const requireRole = (requiredRole: 'admin' | 'sysop'): boolean => {
    return requireAuth() && hasPermission(requiredRole);
  };

  return {
    ...auth,
    role,
    isSysOp,
    isAdmin,
    secureSignIn,
    secureSignUp,
    secureSignOut,
    hasPermission,
    requireAuth,
    requireRole
  };
};
