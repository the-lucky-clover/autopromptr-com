
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
    videoUrl: 'https://videos.pexels.com/video-files/3130284/3130284-uhd_2560_1440_25fps.mp4',
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
            blendMode: videoProfile.video_background_blend_mode || 'multiply'
          }));
        }
      }
    };

    loadVideoSettings();
  }, [user]);

  return { videoSettings, setVideoSettings };
};
