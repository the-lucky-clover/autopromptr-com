
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import MainAuthForm from '@/components/auth/MainAuthForm';
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen';
import EmailSuccessScreen from '@/components/auth/EmailSuccessScreen';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const { signUp, signIn, user, isEmailVerified, resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isEmailVerified) {
      navigate('/dashboard');
    }
  }, [user, isEmailVerified, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Try signing in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      setShowEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a verification link.",
      });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (user && !isEmailVerified) {
      toast({
        title: "Email not verified",
        description: "Please check your email and verify your account.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    const { error } = await resendVerification(email);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email resent",
        description: "We've sent another verification link to your email.",
      });
    }
  };

  if (user && !isEmailVerified) {
    return (
      <EmailVerificationScreen 
        email={user.email || email}
        onResendVerification={handleResendVerification}
      />
    );
  }

  if (showEmailSent) {
    return (
      <EmailSuccessScreen 
        onResendVerification={handleResendVerification}
        onBackToSignIn={() => setShowEmailSent(false)}
      />
    );
  }

  return (
    <MainAuthForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loading={loading}
      onSignUp={handleSignUp}
      onSignIn={handleSignIn}
    />
  );
};

export default Auth;
