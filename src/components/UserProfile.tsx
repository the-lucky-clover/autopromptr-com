
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, CreditCard, User, Key, Shield, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const { hasApiKey } = useSecureApiKeys();
  const { toast } = useToast();

  // Load user profile on mount
  useState(() => {
    if (user) {
      loadProfile();
    }
  });

  const loadProfile = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  };

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update your profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const hasSecureApiKeys = hasApiKey('openai_api_key');

  const handleClose = () => {
    setIsOpen(false);
  };

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
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : null}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 animate-fade-in" 
            onClick={handleClose}
          />
          <Card className="absolute bottom-full left-0 mb-2 w-80 bg-gray-900/90 backdrop-blur-xl border-white/20 z-50 rounded-xl shadow-2xl shadow-black/50 animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-white/5 rounded-xl">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-medium">
                      {getInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-gray-800 border-white/20 hover:bg-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
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
