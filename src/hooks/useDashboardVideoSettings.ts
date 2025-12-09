
import { useState, useEffect } from 'react';
import { cloudflare, CloudflareUser } from "@/integrations/cloudflare/client";

interface VideoSettings {
  enabled: boolean;
  videoUrl: string;
  showAttribution: boolean;
  opacity: number;
  blendMode: string;
}

const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  enabled: true,
  videoUrl: 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4',
  showAttribution: true,
  opacity: 85,
  blendMode: 'multiply'
};

export const useDashboardVideoSettings = (user: CloudflareUser | null) => {
  const [videoSettings, setVideoSettings] = useState<VideoSettings>(DEFAULT_VIDEO_SETTINGS);

  useEffect(() => {
    const loadVideoSettings = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await cloudflare
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error loading video settings:', error);
          return;
        }
        
        if (profile) {
          const videoProfile = profile as any;
          setVideoSettings(prev => ({
            ...prev,
            enabled: videoProfile.video_background_enabled ?? true,
            opacity: videoProfile.video_background_opacity || 85,
            blendMode: videoProfile.video_background_blend_mode || 'multiply',
            videoUrl: videoProfile.video_background_url || DEFAULT_VIDEO_SETTINGS.videoUrl
          }));
        }
      } catch (error) {
        console.error('Exception loading video settings:', error);
      }
    };

    loadVideoSettings();
  }, [user]);

  return { videoSettings, setVideoSettings };
};
