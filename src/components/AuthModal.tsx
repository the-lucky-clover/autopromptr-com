import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import EmailVerificationScreen from './auth/EmailVerificationScreen';
import AuthForm from './auth/AuthForm';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  isMobile?: boolean;
}

const AuthModal = ({ mode: initialMode, onClose, isMobile = false }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [resendLoading, setResendLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<'idle' | 'creating' | 'sending' | 'complete' | 'error'>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp, signIn, resendVerification } = useAuth();

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' && !loading && progressStep === 'idle') {
        // Only handle Enter if not currently processing and not in an input field
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          if (mode === 'signup') {
            handleSignUp(event as any);
          } else {
            handleSignIn(event as any);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, loading, progressStep, email, password, onClose]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgressStep('creating');
    setProgressMessage('Creating your account...');
    setErrorMessage('');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setProgressStep('error');
      console.error('Signup error details:', error);
      
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setErrorMessage('This email is already registered. Try signing in instead.');
      } else if (error.message.includes('Invalid email')) {
        setErrorMessage('Please enter a valid email address.');
      } else if (error.message.includes('Password')) {
        setErrorMessage('Password must be at least 6 characters long.');
      } else {
        setErrorMessage(`Signup failed: ${error.message}`);
      }
      
      setTimeout(() => {
        setProgressStep('idle');
        setErrorMessage('');
      }, 4000);
    } else {
      setProgressStep('sending');
      setProgressMessage('Account created! Sending verification email...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgressStep('complete');
      setProgressMessage('Check your email for verification link!');
      
      setTimeout(() => {
        setShowEmailSent(true);
        setProgressStep('idle');
      }, 1500);
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    console.log('🔐 Starting sign-in process for:', email);
    
    setLoading(true);
    setProgressStep('creating');
    setProgressMessage('Signing you in...');
    setErrorMessage('');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const { error } = await signIn(email, password);
    
    console.log('🔐 Sign-in response:', error ? 'Error' : 'Success', error);
    
    if (error) {
      setProgressStep('error');
      console.error('❌ Signin error details:', error);
      
      // Handle different error types
      if (error.message.includes('Invalid login credentials')) {
        setErrorMessage('❌ Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMessage('⚠️ Please verify your email address. Check your inbox for the verification link.');
      } else if (error.message.includes('User not found')) {
        setErrorMessage('❌ No account found with this email. Please sign up first.');
      } else if (error.message.includes('Too many requests')) {
        setErrorMessage('⏱️ Too many attempts. Please wait a moment and try again.');
      } else {
        setErrorMessage(`❌ Sign in failed: ${error.message}`);
      }
      
      setTimeout(() => {
        setProgressStep('idle');
      }, 5000);
      
      // Don't clear error message automatically for better user experience
      setTimeout(() => {
        setErrorMessage('');
      }, 7000);
    } else {
      console.log('✅ Sign-in successful! Redirecting...');
      setProgressStep('complete');
      setProgressMessage('✅ Welcome back! Redirecting...');
      
      // Close the modal immediately and let the auth hook handle redirect
      setTimeout(() => {
        onClose();
      }, 1000);
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    console.log('Attempting to resend verification for:', email);
    
    const { error } = await resendVerification(email);
    
    if (error) {
      console.error('Resend verification error:', error);
      setErrorMessage(`Failed to resend verification: ${error.message}`);
    } else {
      setErrorMessage('');
      console.log('Verification email resent successfully');
    }
    setResendLoading(false);
  };

  const handleForgotPassword = () => {
    setErrorMessage("Password reset functionality will be available soon. Please contact support if needed.");
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const getProgressValue = () => {
    switch (progressStep) {
      case 'creating': return 30;
      case 'sending': return 70;
      case 'complete': return 100;
      case 'error': return 100;
      default: return 0;
    }
  };

  const getProgressBarColor = () => {
    switch (progressStep) {
      case 'error': return 'bg-red-500';
      case 'complete': return 'bg-green-500';
      default: return 'bg-gradient-to-r from-purple-500 to-blue-500';
    }
  };

  if (showEmailSent) {
    return (
      <EmailVerificationScreen
        onClose={onClose}
        onResendVerification={handleResendVerification}
        onChangeEmail={() => setShowEmailSent(false)}
        onSignUpClick={() => {
          setShowEmailSent(false);
          setMode('signup');
        }}
        resendLoading={resendLoading}
        isMobile={isMobile}
        errorMessage={errorMessage}
        onErrorClear={() => setErrorMessage('')}
      />
    );
  }

  return (
    <div className={`skeuomorphic-card elevation-4 animate-scale-in ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 skeuomorphic-button rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground skeuomorphic-heading">AutoPromptr</h3>
            <p className="text-sm text-muted-foreground skeuomorphic-text">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar Section */}
      {progressStep !== 'idle' && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Progress 
              value={getProgressValue()} 
              className="h-3 bg-gray-700 overflow-hidden rounded-full"
            />
            <div 
              className={`absolute top-0 left-0 h-full ${getProgressBarColor()} transition-all duration-1000 ease-out rounded-full`}
              style={{ 
                width: `${getProgressValue()}%`,
                transition: 'width 1s ease-out'
              }}
            />
          </div>
          <div className="text-center">
            {progressStep === 'error' ? (
              <p className="text-red-400 text-sm animate-pulse">{errorMessage}</p>
            ) : (
              <p className="text-purple-300 text-sm animate-pulse">{progressMessage}</p>
            )}
          </div>
          {progressStep !== 'error' && (
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full ${progressStep === 'creating' ? 'bg-purple-400 animate-pulse' : (progressStep === 'sending' || progressStep === 'complete') ? 'bg-purple-600' : 'bg-gray-600'}`} />
                <div className={`w-2 h-2 rounded-full ${progressStep === 'sending' ? 'bg-blue-400 animate-pulse' : progressStep === 'complete' ? 'bg-blue-600' : 'bg-gray-600'}`} />
                <div className={`w-2 h-2 rounded-full ${progressStep === 'complete' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message Display - Show on idle or error state */}
      {errorMessage && (progressStep === 'idle' || progressStep === 'error') && (
        <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded-xl animate-pulse">
          <p className="text-red-200 text-sm text-center font-medium leading-relaxed">{errorMessage}</p>
        </div>
      )}

      <AuthForm
        mode={mode}
        onModeChange={setMode}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onForgotPassword={handleForgotPassword}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        username={username}
        setUsername={setUsername}
        loading={loading}
      />
    </div>
  );
};

export default AuthModal;
