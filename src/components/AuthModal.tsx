
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Mail, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn, user, isEmailVerified } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  if (showEmailSent) {
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
        <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
        <p className="text-gray-300 mb-4 text-sm">
          We've sent you a verification link. Please check your email and click the link to complete your registration.
        </p>
        <Button 
          onClick={() => setShowEmailSent(false)}
          variant="outline" 
          className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 rounded-xl"
        >
          Back to Sign In
        </Button>
      </div>
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

      <Tabs value={mode} onValueChange={(value) => setMode(value as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700 rounded-xl">
          <TabsTrigger value="signin" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600 rounded-xl">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600 rounded-xl">
            Sign Up
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="mt-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10 rounded-xl"
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white rounded-xl"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Forgot password? Check your email for magic link login.
            </p>
          </form>
        </TabsContent>
        
        <TabsContent value="signup" className="mt-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10 rounded-xl"
                  placeholder="Create a password (min 6 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white rounded-xl"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Check your email after signup to verify your account.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthModal;
