
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

interface VideoSettings {
  enabled: boolean;
  videoUrl: string;
  showAttribution: boolean;
  opacity: number;
  blendMode: string;
}

export const useDashboardVideoSettings = (user: User | null) => {
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    enabled: true,
    videoUrl: 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4',
    showAttribution: true,
    opacity: 85,
    blendMode: 'multiply'
  });

  useEffect(() => {
    const loadVideoSettings = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const videoProfile = profile as any;
          setVideoSettings(prev => ({
            ...prev,
            enabled: videoProfile.video_background_enabled ?? true,
            opacity: videoProfile.video_background_opacity || 85,
            blendMode: videoProfile.video_background_blend_mode || 'multiply',
            videoUrl: videoProfile.video_background_url || 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4'
          }));
        }
      }
    };

    loadVideoSettings();
  }, [user]);

  return { videoSettings, setVideoSettings };
};
