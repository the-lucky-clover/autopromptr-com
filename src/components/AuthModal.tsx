
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { signUp, signIn, user, isEmailVerified, resendVerification } = useAuth();
  const { toast } = useToast();

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
        description: "We've sent you a verification link to complete registration.",
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
        description: "Please check your email and verify your account first.",
        variant: "destructive",
      });
    } else {
      onClose();
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
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
    setResendLoading(false);
  };

  const handleForgotPassword = () => {
    toast({
      title: "Forgot Password",
      description: "Password reset functionality will be available soon. Please contact support if needed.",
    });
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
