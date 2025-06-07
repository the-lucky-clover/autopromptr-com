
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [resendLoading, setResendLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<'idle' | 'creating' | 'sending' | 'complete' | 'error'>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp, signIn, user, isEmailVerified, resendVerification } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgressStep('creating');
    setProgressMessage('Creating your account...');
    setErrorMessage('');
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Show progress
    
    const { error } = await signUp(email, password);
    
    if (error) {
      setProgressStep('error');
      if (error.message.includes('already registered')) {
        setErrorMessage('This email is already registered. Try signing in instead.');
      } else {
        setErrorMessage(error.message);
      }
      setTimeout(() => {
        setProgressStep('idle');
        setErrorMessage('');
      }, 3000);
    } else {
      setProgressStep('sending');
      setProgressMessage('Sending verification email...');
      
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
    setLoading(true);
    setProgressStep('creating');
    setProgressMessage('Signing you in...');
    setErrorMessage('');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setProgressStep('error');
      setErrorMessage(error.message);
      setTimeout(() => {
        setProgressStep('idle');
        setErrorMessage('');
      }, 3000);
    } else if (user && !isEmailVerified) {
      setProgressStep('error');
      setErrorMessage('Please check your email and verify your account first.');
      setTimeout(() => {
        setProgressStep('idle');
        setErrorMessage('');
      }, 3000);
    } else {
      setProgressStep('complete');
      setProgressMessage('Welcome back!');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    const { error } = await resendVerification(email);
    
    if (error) {
      setErrorMessage(error.message);
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
    <div className={`bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AutoPromptr</h3>
            <p className="text-sm text-gray-300">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>
        </div>
        {!isMobile && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar Section */}
      {progressStep !== 'idle' && (
        <div className="mb-6 space-y-3">
          <Progress 
            value={getProgressValue()} 
            className={`h-2 ${progressStep === 'error' ? 'bg-red-900' : 'bg-gray-700'}`}
          />
          <div className="text-center">
            {progressStep === 'error' ? (
              <p className="text-red-400 text-sm">{errorMessage}</p>
            ) : (
              <p className="text-purple-300 text-sm">{progressMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && progressStep === 'idle' && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-xl">
          <p className="text-red-300 text-sm text-center">{errorMessage}</p>
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
        loading={loading}
      />
    </div>
  );
};

export default AuthModal;
