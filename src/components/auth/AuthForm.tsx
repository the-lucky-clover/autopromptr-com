
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (fullName: string) => void;
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
  fullName,
  setFullName,
  loading
}: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={mode === 'signup' ? onSignUp : onSignIn} className="space-y-4">
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-200">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-200">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-200">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 h-auto"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl py-2 font-medium transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
      </Button>

      <div className="flex items-center justify-center space-x-2 text-sm">
        <span className="text-gray-400">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onModeChange(mode === 'signup' ? 'signin' : 'signup')}
          className="text-purple-400 hover:text-purple-300 p-0 h-auto font-medium"
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up'}
        </Button>
      </div>

      {mode === 'signin' && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onForgotPassword}
            className="text-gray-400 hover:text-white p-0 h-auto text-sm"
          >
            Forgot your password?
          </Button>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
