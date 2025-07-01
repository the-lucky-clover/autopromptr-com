
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
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeVideo, setActiveVideo] = useState(1);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const currentVideo = useTimeBasedVideo(userVideoUrl);

  useEffect(() => {
    if (!enabled || !currentVideo.url) return;

    const video1 = videoRef1.current;
    const video2 = videoRef2.current;
    if (!video1 || !video2) return;

    console.log(`Loading video: ${currentVideo.period} - ${currentVideo.url}`);
    setIsLoaded(false);
    setHasError(false);

    const setupVideo = (video: HTMLVideoElement) => {
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
        // Create seamless crossfade by switching videos before the end
        if (video.currentTime >= video.duration - 1) {
          const otherVideo = video === video1 ? video2 : video1;
          const currentVideoNum = video === video1 ? 1 : 2;
          const otherVideoNum = currentVideoNum === 1 ? 2 : 1;
          
          // Reset the other video to start
          otherVideo.currentTime = 0;
          otherVideo.play().catch(console.error);
          
          // Crossfade with 0.5 second transition
          setTimeout(() => {
            setActiveVideo(otherVideoNum);
            // Reset current video after crossfade
            setTimeout(() => {
              video.currentTime = 0;
            }, 500);
          }, 100);
        }
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    };

    const cleanup1 = setupVideo(video1);
    const cleanup2 = setupVideo(video2);

    // Start loading both videos
    video1.load();
    video2.load();

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [enabled, currentVideo.url, loadAttempts]);

  if (!enabled || hasError) {
    if (hasError) {
      console.error('Video background failed to load after retries');
    }
    return null;
  }

  const getVideoOpacity = (videoNum: number) => {
    if (!isLoaded) return 0;
    return activeVideo === videoNum ? opacity / 100 : 0;
  };

  return (
    <div className="absolute inset-0 overflow-hidden rounded-b-xl">
      {/* Video 1 */}
      <video
        ref={videoRef1}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: getVideoOpacity(1),
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

      {/* Video 2 - for seamless crossfading */}
      <video
        ref={videoRef2}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          opacity: getVideoOpacity(2),
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
            className="text-white/20 hover:text-white/30 text-[8px] bg-black/10 px-1 py-0.5 rounded backdrop-blur-sm transition-colors font-sans"
          >
            Pexels
          </a>
        </div>
      )}
    </div>
  );
};

export default EnhancedWelcomeVideoBackground;
