
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloudflare } from '@/integrations/cloudflare/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await cloudflare.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.session?.user) {
          setSuccess(true);
          setLoading(false);
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError('No valid session found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-white">Verifying your email...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-center">
              Please wait while we verify your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-white">Email verified successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-center mb-4">
              Your email has been verified. You'll be redirected to your dashboard shortly.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-white">Verification failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-center mb-4">
            {error || 'There was an issue verifying your email.'}
          </p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 rounded-xl"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
