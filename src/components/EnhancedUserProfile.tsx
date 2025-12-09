
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cloudflare } from '@/integrations/cloudflare/client';
import { useToast } from '@/hooks/use-toast';

const EnhancedUserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: profile } = await cloudflare
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const getInitial = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getUsername = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await cloudflare.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = cloudflare.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await cloudflare
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="h-8 w-8 bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsOpen(false);
      }}
    >
      {/* Main Profile Container */}
      <div className="relative overflow-hidden rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        {/* Avatar Section */}
        <div className="flex items-center p-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <Avatar className="h-8 w-8 ring-1 ring-purple-400/30">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          
          {/* User Info - slides out on hover */}
          <div className={`ml-2 transition-all duration-300 overflow-hidden ${
            isHovered ? 'w-28 opacity-100' : 'w-0 opacity-0'
          }`}>
            <p className="text-white text-xs font-medium truncate">
              {getUsername()}
            </p>
            <p className="text-white/60 text-xs truncate">
              {user?.email}
            </p>
          </div>
          
          {/* Upload indicator */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Expanded Menu */}
        {isOpen && (
          <div className="border-t border-gray-700/50 p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full justify-start text-white hover:bg-white/10 rounded-lg text-sm py-2"
            >
              <Upload className="h-4 w-4 mr-3" />
              Upload Avatar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white hover:bg-white/10 rounded-lg text-sm py-2"
            >
              <User className="h-4 w-4 mr-3" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-white hover:bg-red-500/20 hover:text-red-300 rounded-lg text-sm py-2"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload avatar image"
          onChange={handleAvatarUpload}
        />
      </div>
    </div>
  );
};

export default EnhancedUserProfile;
