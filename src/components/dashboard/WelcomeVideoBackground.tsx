
import React, { useRef, useEffect, useState } from 'react';

interface WelcomeVideoBackgroundProps {
  videoUrl: string;
  opacity: number;
  blendMode: string;
  enabled: boolean;
}

const WelcomeVideoBackground = ({ 
  videoUrl, 
  opacity, 
  blendMode, 
  enabled 
}: WelcomeVideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Convert Pexels share URL to direct video URL
  const getVideoSource = (url: string) => {
    // Handle Pexels share URL format
    if (url.includes('pexels.com/video/') && !url.includes('.mp4')) {
      const videoId = url.match(/\/video\/.*?-(\d+)\//)?.[1];
      if (videoId) {
        return `https://videos.pexels.com/video-files/${videoId}/${videoId}-uhd_2560_1440_25fps.mp4`;
      }
    }
    return url;
  };

  const processedVideoUrl = getVideoSource(videoUrl);

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
    </div>
  );
};

export default WelcomeVideoBackground;
