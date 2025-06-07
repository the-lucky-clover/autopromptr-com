
import { Button } from '@/components/ui/button';
import { CheckCircle, X, RotateCcw } from 'lucide-react';
import EmailProviderLinks from './EmailProviderLinks';

interface EmailVerificationScreenProps {
  onClose: () => void;
  onResendVerification: () => Promise<void>;
  onChangeEmail: () => void;
  onSignUpClick: () => void;
  resendLoading: boolean;
  isMobile?: boolean;
}

const EmailVerificationScreen = ({
  onClose,
  onResendVerification,
  onChangeEmail,
  onSignUpClick,
  resendLoading,
  isMobile = false
}: EmailVerificationScreenProps) => {
  const openEmailProvider = (provider: string) => {
    let url = '';
    const searchTerm = 'AutoPromptr verification';
    
    switch (provider) {
      case 'gmail':
        url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(searchTerm)}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/mail/0/search?q=${encodeURIComponent(searchTerm)}`;
        break;
      case 'yahoo':
        url = `https://mail.yahoo.com/d/search/keyword=${encodeURIComponent(searchTerm)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center">
      {!isMobile && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-gray-400 hover:text-white rounded-xl"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
      <p className="text-gray-300 mb-4 text-sm">
        We've sent you a verification link to complete your registration.
      </p>
      
      <EmailProviderLinks onProviderClick={openEmailProvider} />

      <p className="text-gray-400 text-sm mb-4">Not seeing it in your inbox?</p>
      
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={onResendVerification}
          disabled={resendLoading}
          variant="outline" 
          className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 rounded-xl"
        >
          {resendLoading ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
              Resending...
            </>
          ) : (
            'Resend the link'
          )}
        </Button>
        
        <p className="text-gray-400 text-xs">or</p>
        
        <Button
          onClick={onChangeEmail}
          variant="ghost"
          className="text-purple-300 hover:bg-purple-500/10 rounded-xl"
        >
          Change your email
        </Button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm mb-2">New to AutoPromptr?</p>
        <Button
          onClick={onSignUpClick}
          variant="ghost"
          className="text-purple-300 hover:bg-purple-500/10 rounded-xl font-semibold"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationScreen;
