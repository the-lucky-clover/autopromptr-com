import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  isEmailVerified: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize email verification status to prevent unnecessary re-renders
  const isEmailVerified = useMemo(() => {
    return user?.email_confirmed_at !== null;
  }, [user?.email_confirmed_at]);

  useEffect(() => {
    // If Supabase is not configured, initialize in public mode
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, initializing in public mode');
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User email_confirmed_at:', session.user.email_confirmed_at);
          
          // Check email verification status
          const verified = session.user.email_confirmed_at !== null;
          console.log('Email verification status:', verified);

          // Only auto-redirect on explicit SIGNED_IN events (not INITIAL_SESSION or TOKEN_REFRESHED)
          // This prevents redirect loops on page load
          if (verified && event === 'SIGNED_IN') {
            console.log('Auto-redirecting verified user to dashboard on sign in');
            // Use setTimeout to prevent immediate redirect conflicts
            setTimeout(() => {
              if (window.location.pathname === '/' || window.location.pathname === '/auth') {
                window.location.href = '/dashboard';
              }
            }, 100);
          }
        }
        
        setLoading(false);
        setIsInitialized(true);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialized(true);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    console.log('Starting signup process for:', email);
    
    // Clear any existing session first
    try {
      await supabase.auth.signOut();
      console.log('Cleared existing session');
    } catch (err) {
      console.log('No existing session to clear');
    }
    
    // Use the current origin for redirect
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('Using redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { name: fullName } : undefined
      }
    });
    
    console.log('Signup response:', { data, error });
    
    if (error) {
      console.error('Signup error:', error);
      return { error };
    }
    
    if (data?.user) {
      console.log('User created successfully:', data.user);
      console.log('Email confirmation required:', !data.user.email_confirmed_at);
      
      // Set user state immediately after signup
      setUser(data.user);
    }
    
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Starting signin process for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Signin response:', { data, error });
    
    if (error) {
      console.error('Signin error:', error);
      return { error };
    }

    // The onAuthStateChange will handle the redirect
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    console.log('Resending verification email to:', email);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('Using redirect URL for resend:', redirectUrl);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    console.log('Resend verification response:', { error });
    
    if (error) {
      console.error('Resend verification error:', error);
    }
    
    return { error };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendVerification,
    isEmailVerified,
    isInitialized
  }), [user, session, loading, signUp, signIn, signOut, resendVerification, isEmailVerified, isInitialized]);

  // Don't render children until auth context is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Provide a more graceful fallback instead of throwing
    console.warn('useAuth called outside of AuthProvider context');
    return {
      user: null,
      session: null,
      loading: true,
      signUp: async () => ({ error: new Error('Auth not available') }),
      signIn: async () => ({ error: new Error('Auth not available') }),
      signOut: async () => {},
      resendVerification: async () => ({ error: new Error('Auth not available') }),
      isEmailVerified: false,
      isInitialized: false
    };
  }
  return context;
};
