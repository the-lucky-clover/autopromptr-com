import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { cloudflare, isCloudflareConfigured } from '@/integrations/cloudflare/client';

/**
 * Auth Test Page
 * Use this page to diagnose sign-in issues
 * Navigate to /auth-test to access
 */
const AuthTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const { signIn, user, session } = useAuth();

  const handleDirectSignIn = async () => {
    console.log('🧪 Testing direct sign-in...');
    setResult({ loading: true });
    
    try {
      const { data, error } = await cloudflare.auth.signInWithPassword({
        email,
        password,
      });
      
      setResult({
        success: !error,
        data,
        error: error ? {
          message: error.message
        } : null
      });
    } catch (err: any) {
      setResult({
        success: false,
        error: {
          message: err.message,
          stack: err.stack
        }
      });
    }
  };

  const handleHookSignIn = async () => {
    console.log('🧪 Testing hook sign-in...');
    setResult({ loading: true });
    
    const { error } = await signIn(email, password);
    
    setResult({
      success: !error,
      error: error ? {
        message: error.message
      } : null
    });
  };

  const checkConnection = async () => {
    console.log('🧪 Testing Cloudflare connection...');
    setResult({ loading: true });
    
    try {
      const { data: { session }, error } = await cloudflare.auth.getSession();
      setResult({
        configured: isCloudflareConfigured,
        hasSession: !!session,
        session: session ? {
          user: session.user.email,
          verified: !!session.user.email_confirmed_at
        } : null,
        error: error ? error.message : null
      });
    } catch (err: any) {
      setResult({
        configured: isCloudflareConfigured,
        error: err.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Diagnostics</CardTitle>
            <CardDescription>
              Test sign-in functionality and diagnose issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleDirectSignIn}>
                Test Direct Sign-In
              </Button>
              <Button onClick={handleHookSignIn} variant="secondary">
                Test Hook Sign-In
              </Button>
              <Button onClick={checkConnection} variant="outline">
                Check Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Supabase Configured:</strong> {isSupabaseConfigured ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User:</strong> {user ? `✅ ${user.email}` : '❌ Not signed in'}</p>
              <p><strong>Session:</strong> {session ? '✅ Active' : '❌ None'}</p>
              <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? '✅ Yes' : '⚠️ No'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/50">
          <CardHeader>
            <CardTitle>💡 Common Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Invalid credentials:</strong> Check email/password are correct</p>
            <p><strong>No account:</strong> Sign up first at / (landing page)</p>
            <p><strong>Email not verified:</strong> Check inbox for verification email</p>
            <p><strong>Network error:</strong> Check browser console and network tab</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTest;
