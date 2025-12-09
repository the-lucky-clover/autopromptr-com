
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cloudflare } from '@/integrations/cloudflare/client';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGreeting, setShowGreeting] = useState(false);
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

  // Load user profile on mount
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

  const handleMouseEnter = () => {
    setShowGreeting(true);
  };

  const handleMouseLeave = () => {
    setShowGreeting(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowGreeting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-12 w-12 bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      {/* Animated greeting */}
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-500 ease-out ${
        showGreeting 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`}>
        <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg border border-white/20 whitespace-nowrap">
          <span className="text-sm font-medium">Hi {getUsername()}!</span>
        </div>
      </div>

      {/* Avatar button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        className={`p-2 h-auto hover:bg-white/10 rounded-xl transition-all duration-300 ${
          showGreeting ? 'scale-110 shadow-lg shadow-purple-500/25' : ''
        }`}
      >
        <div className="relative">
          <Avatar className={`transition-all duration-300 ${
            showGreeting ? 'h-12 w-12 ring-2 ring-purple-400/50' : 'h-10 w-10'
          }`}>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload indicator */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </Button>

      {/* Minimalist profile menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in" 
            onClick={handleClose}
          />
          <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-48 bg-gray-900/95 backdrop-blur-xl border-white/20 z-50 rounded-xl shadow-2xl shadow-black/50 animate-scale-in">
            <CardContent className="p-3">
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-purple-400/30">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-medium">
                      {getInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-gray-800 border-white/20 hover:bg-gray-700 rounded-full"
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
                    aria-label="Upload avatar image"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-white text-sm font-medium truncate">
                  {getUsername()}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {user?.email}
                </p>
              </div>
              
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white hover:bg-white/10 rounded-lg text-sm py-2"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserProfile;
