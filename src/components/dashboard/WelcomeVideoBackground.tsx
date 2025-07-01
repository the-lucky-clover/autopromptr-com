
import React, { useRef, useEffect, useState } from 'react';

interface WelcomeVideoBackgroundProps {
  videoUrl: string;
  opacity: number;
  blendMode: string;
  enabled: boolean;
  showAttribution?: boolean;
}

const WelcomeVideoBackground = ({ 
  videoUrl, 
  opacity, 
  blendMode, 
  enabled,
  showAttribution = true
}: WelcomeVideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced video URL conversion for Pexels URLs
  const getVideoSource = (url: string) => {
    // Handle Pexels share URL format
    if (url.includes('pexels.com/video/') && !url.includes('.mp4')) {
      const videoId = url.match(/\/video\/.*?-(\d+)\//)?.[1];
      if (videoId) {
        // Try different quality options in order of preference
        const qualityOptions = [
          `https://videos.pexels.com/video-files/${videoId}/${videoId}-hd_1920_1080_30fps.mp4`,
          `https://videos.pexels.com/video-files/${videoId}/${videoId}-uhd_2560_1440_25fps.mp4`,
          `https://videos.pexels.com/video-files/${videoId}/${videoId}-hd_1280_720_30fps.mp4`
        ];
        return qualityOptions[0]; // Default to HD 1080p
      }
    }
    return url;
  };

  // Get attribution URL from video URL
  const getAttributionUrl = (url: string) => {
    if (url.includes('videos.pexels.com/video-files/852435/')) {
      return 'https://www.pexels.com/video/time-lapse-video-of-aurora-borealis-852435/';
    }
    // Default fallback for other videos
    if (url.includes('pexels.com') || url.includes('videos.pexels.com')) {
      const videoId = url.match(/\/(\d+)\//)?.[1];
      if (videoId) {
        return `https://www.pexels.com/video/${videoId}/`;
      }
    }
    return null;
  };

  const processedVideoUrl = getVideoSource(videoUrl);
  const attributionUrl = getAttributionUrl(processedVideoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(console.error);
    };

    const handleTimeUpdate = () => {
      // Create seamless loop by restarting slightly before the end
      if (video.currentTime >= video.duration - 0.5) {
        video.currentTime = 0;
      }
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [enabled, processedVideoUrl]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          opacity: isLoaded ? opacity / 100 : 0,
          mixBlendMode: blendMode as any,
        }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={processedVideoUrl} type="video/mp4" />
      </video>
      
      {/* Gradient overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Attribution link */}
      {showAttribution && attributionUrl && (
        <div className="absolute bottom-2 right-2 z-10">
          <a
            href={attributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white/80 text-xs bg-black/20 px-2 py-1 rounded backdrop-blur-sm transition-colors"
          >
            Video by Pexels
          </a>
        </div>
      )}
    </div>
  );
};

export default WelcomeVideoBackground;
