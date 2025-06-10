
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { AuthBrandingHeader } from './AuthBrandingHeader';

interface EmailSuccessScreenProps {
  onResendVerification: () => Promise<void>;
  onBackToSignIn: () => void;
}

const EmailSuccessScreen = ({ onResendVerification, onBackToSignIn }: EmailSuccessScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
        <CardHeader className="text-center">
          <AuthBrandingHeader />
          <div className="mx-auto mb-4 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <CardTitle className="text-white">Check Your Email</CardTitle>
          <CardDescription className="text-gray-300">
            We've sent you a verification link. Please check your email and click the link to complete your registration.
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
            onClick={onBackToSignIn}
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSuccessScreen;
