
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, CreditCard, User, Key, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { hasApiKey } = useSecureApiKeys();

  const getInitial = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasSecureApiKeys = hasApiKey('openai_api_key');

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-0 h-auto hover:bg-white/10 rounded-xl"
      >
        <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white text-sm font-medium truncate">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-white/70 text-xs">Online</p>
              {hasSecureApiKeys && (
                <div className="flex items-center">
                  <Shield className="h-3 w-3 text-green-400" />
                  <span className="text-green-400 text-xs ml-1">Secure</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute bottom-full left-0 mb-2 w-80 bg-white/10 backdrop-blur-xl border-white/20 z-50 rounded-xl shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-white/5 rounded-xl">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-medium">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-white/70 text-xs">Signed in</p>
                    {hasSecureApiKeys && (
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 text-green-400" />
                        <span className="text-green-400 text-xs ml-1">Keys Secured</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white hover:bg-white/10 rounded-xl"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Subscription
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white hover:bg-white/10 rounded-xl"
                >
                  <User className="h-4 w-4 mr-3" />
                  Change Email
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white hover:bg-white/10 rounded-xl"
                >
                  <Key className="h-4 w-4 mr-3" />
                  Change Password
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white hover:bg-white/10 rounded-xl"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Two-Factor Auth
                </Button>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start text-white hover:bg-red-500/20 hover:text-red-300 rounded-xl"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserProfile;
