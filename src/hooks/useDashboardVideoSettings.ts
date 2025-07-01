
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
    videoUrl: 'https://www.pexels.com/video/time-lapse-of-city-at-night-10182004/',
    showAttribution: true,
    opacity: 100,
    blendMode: 'normal'
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
            opacity: videoProfile.video_background_opacity || 100,
            blendMode: videoProfile.video_background_blend_mode || 'normal',
            videoUrl: videoProfile.video_background_url || 'https://www.pexels.com/video/time-lapse-of-city-at-night-10182004/'
          }));
        }
      }
    };

    loadVideoSettings();
  }, [user]);

  return { videoSettings, setVideoSettings };
};
