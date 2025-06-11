
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthBrandingHeader } from './AuthBrandingHeader';

interface EmailVerificationScreenProps {
  email?: string;
  onResendVerification: () => Promise<void>;
  onClose?: () => void;
  onChangeEmail?: () => void;
  onSignUpClick?: () => void;
  resendLoading?: boolean;
  isMobile?: boolean;
  errorMessage?: string;
  onErrorClear?: () => void;
}

const EmailVerificationScreen = ({ 
  email, 
  onResendVerification,
  onClose,
  onChangeEmail,
  onSignUpClick,
  resendLoading = false,
  isMobile = false,
  errorMessage,
  onErrorClear
}: EmailVerificationScreenProps) => {
  // If used as a modal (has onClose), render modal version
  if (onClose) {
    return (
      <div className={`bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Check Your Email</h3>
              <p className="text-sm text-gray-300">Verification link sent</p>
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

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-xl">
            <p className="text-red-300 text-sm text-center">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-300 text-sm text-center">
            We've sent a verification link to your email. Please check your email and click the link to verify your account.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onResendVerification}
              disabled={resendLoading}
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            {onChangeEmail && (
              <Button 
                onClick={onChangeEmail}
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white"
              >
                Change Email Address
              </Button>
            )}
            
            {onSignUpClick && (
              <Button 
                onClick={onSignUpClick}
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white"
              >
                Back to Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full page version for /auth route
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
        <CardHeader className="text-center">
          <AuthBrandingHeader />
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <CardTitle className="text-white">Check Your Email</CardTitle>
          <CardDescription className="text-gray-300">
            We've sent a verification link to {email}. Please check your email and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={onResendVerification}
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Resend Verification Email
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationScreen;
