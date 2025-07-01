
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video, Save } from "lucide-react";

export const VideoBackgroundCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enabled: true,
    videoUrl: 'https://www.pexels.com/video/time-lapse-of-city-at-night-10182004/',
    opacity: 100,
    blendMode: 'normal'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const extendedProfile = profile as any;
          setSettings({
            enabled: extendedProfile.video_background_enabled ?? true,
            opacity: extendedProfile.video_background_opacity || 100,
            blendMode: extendedProfile.video_background_blend_mode || 'normal',
            videoUrl: extendedProfile.video_background_url || 'https://www.pexels.com/video/time-lapse-of-city-at-night-10182004/'
          });
        }
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          video_background_enabled: settings.enabled,
          video_background_opacity: settings.opacity,
          video_background_blend_mode: settings.blendMode,
          video_background_url: settings.videoUrl
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Video background preferences updated successfully.",
      });
      
      // Trigger page reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error saving video settings:', error);
      toast({
        title: "Error",
        description: "Failed to save video background settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="w-5 h-5" />
          Welcome Module Video Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Enable Video Background</Label>
            <p className="text-sm text-purple-200">Show animated background video in welcome module</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-2">
              <Label className="text-white">Video URL (Pexels or Direct MP4)</Label>
              <Input
                value={settings.videoUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://www.pexels.com/video/... or direct MP4 URL"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-sm text-purple-200">
                Use Pexels share URLs or direct MP4 URLs for best performance
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Background Opacity</Label>
              <div className="px-3">
                <Slider
                  value={[settings.opacity]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, opacity: value[0] }))}
                  max={100}
                  min={30}
                  step={5}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-purple-200">{settings.opacity}% opacity</p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Blend Mode</Label>
              <Select
                value={settings.blendMode}
                onValueChange={(blendMode) => setSettings(prev => ({ ...prev, blendMode }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="multiply">Multiply</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                  <SelectItem value="soft-light">Soft Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
