
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Video, Eye, EyeOff, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoSettings {
  enabled: boolean;
  videoUrl: string;
  showAttribution: boolean;
}

const DEFAULT_VIDEO_URL = 'https://videos.pexels.com/video-files/10182004/10182004-hd_1920_1080_25fps.mp4';

export const VideoBackgroundCard = () => {
  const [settings, setSettings] = useState<VideoSettings>({
    enabled: false,
    videoUrl: DEFAULT_VIDEO_URL,
    showAttribution: true
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('videoBackgroundSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse video settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: VideoSettings) => {
    setSettings(newSettings);
    localStorage.setItem('videoBackgroundSettings', JSON.stringify(newSettings));
    toast({
      title: "Settings saved",
      description: "Video background settings have been updated.",
    });
  };

  const validateVideoUrl = (url: string) => {
    if (!url) return false;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    const supportedDomains = ['pexels.com', 'youtube.com', 'vimeo.com'];
    
    try {
      const urlObj = new URL(url);
      const hasValidExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
      const hasValidDomain = supportedDomains.some(domain => urlObj.hostname.includes(domain));
      
      return hasValidExtension || hasValidDomain;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    const valid = validateVideoUrl(url);
    setIsValidUrl(valid);
    setPreviewUrl(url);
  };

  const applySettings = () => {
    if (!isValidUrl && previewUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL.",
        variant: "destructive",
      });
      return;
    }

    const newSettings = {
      ...settings,
      videoUrl: previewUrl || settings.videoUrl
    };

    saveSettings(newSettings);
  };

  const resetToDefault = () => {
    const defaultSettings = {
      enabled: false,
      videoUrl: DEFAULT_VIDEO_URL,
      showAttribution: true
    };
    saveSettings(defaultSettings);
    setPreviewUrl('');
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Video Background</span>
        </CardTitle>
        <CardDescription className="text-purple-200">
          Customize your dashboard with a video background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="video-enabled" className="text-white">Enable Video Background</Label>
            <p className="text-sm text-purple-200">Show video behind dashboard modules</p>
          </div>
          <Switch
            id="video-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => saveSettings({ ...settings, enabled })}
          />
        </div>

        {/* Video URL Input */}
        <div className="space-y-2">
          <Label htmlFor="video-url" className="text-white">Video URL</Label>
          <div className="space-y-2">
            <Input
              id="video-url"
              type="url"
              placeholder="Enter video URL..."
              value={previewUrl || settings.videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            {!isValidUrl && previewUrl && (
              <p className="text-red-400 text-sm">Please enter a valid video URL (.mp4, .webm, .ogg, YouTube, Vimeo, or Pexels)</p>
            )}
          </div>
        </div>

        {/* Default Demo Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Monitor className="h-3 w-3 mr-1" />
              Demo Video
            </Badge>
            <span className="text-sm text-purple-200">Pexels time-lapse city</span>
          </div>
          <Button
            onClick={() => setPreviewUrl(DEFAULT_VIDEO_URL)}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Use Demo
          </Button>
        </div>

        {/* Attribution Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="show-attribution" className="text-white">Show Attribution</Label>
            <p className="text-sm text-purple-200">Display video source credit</p>
          </div>
          <Switch
            id="show-attribution"
            checked={settings.showAttribution}
            onCheckedChange={(showAttribution) => saveSettings({ ...settings, showAttribution })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={applySettings}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Changes
          </Button>
          <Button
            onClick={resetToDefault}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Reset to Default
          </Button>
        </div>

        {/* Settings Preview */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <h4 className="text-white font-medium text-sm">Current Settings</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-purple-300">Status:</span>
              <span className={settings.enabled ? 'text-green-400' : 'text-red-400'}>
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Attribution:</span>
              <span className={settings.showAttribution ? 'text-green-400' : 'text-red-400'}>
                {settings.showAttribution ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
