
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

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
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a verification link to {user.email}. Please check your email and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleResendVerification}
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
  }

  if (showEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
          <CardHeader className="text-center">
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
              onClick={handleResendVerification}
              variant="outline" 
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Resend Verification Email
            </Button>
            <Button 
              onClick={() => setShowEmailSent(false)}
              variant="outline" 
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 flex items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
      
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4 group">
            <Zap 
              className="w-8 h-8" 
              strokeWidth={1.5}
              style={{
                stroke: 'url(#authGradient)',
                filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
              }}
            />
            <span 
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #8B5CF6, #3B82F6)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'heroGradientFlow 6s ease-in-out infinite',
                filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
              }}
            >
              AutoPromptr
            </span>
            
            {/* SVG gradient definition */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6">
                    <animate attributeName="stop-color" 
                      values="#3B82F6;#8B5CF6;#EC4899;#8B5CF6;#3B82F6" 
                      dur="6s" 
                      repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#8B5CF6">
                    <animate attributeName="stop-color" 
                      values="#8B5CF6;#EC4899;#8B5CF6;#3B82F6;#8B5CF6" 
                      dur="6s" 
                      repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#EC4899">
                    <animate attributeName="stop-color" 
                      values="#EC4899;#8B5CF6;#3B82F6;#8B5CF6;#EC4899" 
                      dur="6s" 
                      repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
          </Link>
          
          <CardTitle className="text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
              <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none" 
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Choose a secure password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none" 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
                <p className="text-sm text-gray-400 text-center">
                  You'll receive an email to verify your account
                </p>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              asChild
              variant="ghost" 
              className="text-gray-400 hover:text-white"
            >
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
