
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check email verification status
          console.log('User email_confirmed_at:', session.user.email_confirmed_at);
          console.log('User confirmation status:', session.user.email_confirmed_at !== null);
          
          setTimeout(async () => {
            try {
              const { data } = await supabase
                .from('user_verification_status')
                .select('email_verified')
                .eq('user_id', session.user.id)
                .single();
              
              console.log('Database verification status:', data);
              const verified = data?.email_verified || session.user.email_confirmed_at !== null;
              console.log('Final verification status:', verified);
              setIsEmailVerified(verified);
            } catch (error) {
              console.error('Error checking verification status:', error);
              const verified = session.user.email_confirmed_at !== null;
              console.log('Fallback verification status:', verified);
              setIsEmailVerified(verified);
            }
          }, 0);
        } else {
          setIsEmailVerified(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('Starting signup process for:', email);
    
    // Clear any existing session first
    try {
      await supabase.auth.signOut();
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
        emailRedirectTo: redirectUrl
      }
    });
    
    console.log('Signup response:', { data, error });
    
    if (data?.user && !error) {
      console.log('User created successfully:', data.user);
      console.log('Email confirmation required:', !data.user.email_confirmed_at);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Starting signin process for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Signin response:', { data, error });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const resendVerification = async (email: string) => {
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
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resendVerification,
      isEmailVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
