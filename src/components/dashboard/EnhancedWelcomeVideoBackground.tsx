
import React, { useRef, useEffect, useState } from 'react';
import { useTimeBasedVideo } from '@/hooks/useTimeBasedVideo';

interface EnhancedWelcomeVideoBackgroundProps {
  userVideoUrl?: string;
  opacity?: number;
  blendMode?: string;
  enabled?: boolean;
}

const EnhancedWelcomeVideoBackground = ({ 
  userVideoUrl,
  opacity = 85,
  blendMode = 'multiply',
  enabled = true
}: EnhancedWelcomeVideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const currentVideo = useTimeBasedVideo(userVideoUrl);

  useEffect(() => {
    if (!enabled || !currentVideo.url) return;

    const video = videoRef.current;
    if (!video) return;

    console.log(`Loading video: ${currentVideo.period} - ${currentVideo.url}`);
    setIsLoaded(false);
    setHasError(false);

    const handleLoadedData = () => {
      console.log('Video loaded successfully');
      setIsLoaded(true);
      setHasError(false);
      setLoadAttempts(0);
      
      // Start playing immediately
      video.play().catch(error => {
        console.error('Video play failed:', error);
      });
    };

    const handleError = (error: Event) => {
      console.error('Video loading error:', error, 'URL:', currentVideo.url);
      setHasError(true);
      setIsLoaded(false);
      
      // Retry loading up to 3 times
      if (loadAttempts < 3) {
        setTimeout(() => {
          setLoadAttempts(prev => prev + 1);
          video.load();
        }, 2000);
      }
    };

    const handleTimeUpdate = () => {
      // Create seamless loop by restarting slightly before the end
      if (video.currentTime >= video.duration - 0.5) {
        video.currentTime = 0;
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Start loading the video
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [enabled, currentVideo.url, loadAttempts]);

  if (!enabled || hasError) {
    if (hasError) {
      console.error('Video background failed to load after retries');
    }
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-b-xl">
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
        <source src={currentVideo.url} type="video/mp4" />
      </video>
      
      {/* Gradient overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Micro Attribution link */}
      {currentVideo.attribution && (
        <div className="absolute bottom-1 right-1 z-10">
          <a
            href={currentVideo.attribution}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/50 text-[9px] bg-black/10 px-1 py-0.5 rounded backdrop-blur-sm transition-colors font-sans"
          >
            Pexels
          </a>
        </div>
      )}
    </div>
  );
};

export default EnhancedWelcomeVideoBackground;
