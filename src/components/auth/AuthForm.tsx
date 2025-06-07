
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSignIn: (e: React.FormEvent) => Promise<void>;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
}

const AuthForm = ({
  mode,
  onModeChange,
  onSignIn,
  onSignUp,
  onForgotPassword,
  email,
  setEmail,
  password,
  setPassword,
  loading
}: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'signin' | 'signup')} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700 rounded-xl">
        <TabsTrigger value="signin" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600 rounded-xl">
          Sign In
        </TabsTrigger>
        <TabsTrigger value="signup" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600 rounded-xl">
          Sign Up
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin" className="mt-4">
        <form onSubmit={onSignIn} className="space-y-4">
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
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onForgotPassword}
              className="text-sm text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 rounded-xl"
            >
              Forgot password?
            </Button>
          </div>
        </form>
      </TabsContent>
      
      <TabsContent value="signup" className="mt-4">
        <form onSubmit={onSignUp} className="space-y-4">
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
  );
};

export default AuthForm;
