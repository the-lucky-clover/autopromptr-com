
import { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  enabled: boolean;
  videoUrl: string;
  showAttribution: boolean;
}

const VideoBackground = ({ enabled, videoUrl, showAttribution }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled || !videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      setHasError(false);
      
      // Set up smooth looping at 14 seconds
      const handleTimeUpdate = () => {
        if (video.currentTime >= 14) {
          video.currentTime = 0;
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [enabled, videoUrl]);

  if (!enabled || hasError) return null;

  const getVideoSource = (url: string) => {
    if (url.includes('pexels.com') && !url.includes('.mp4')) {
      // Convert Pexels page URL to direct video URL
      return url.replace(/\/video\/.*\/(\d+)\/.*/, '/video-files/$1/$1-hd_1920_1080_25fps.mp4');
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        src={getVideoSource(videoUrl)}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          filter: 'brightness(0.7) contrast(1.1)',
        }}
      />
      
      {/* Overlay for better module readability */}
      <div 
        className="absolute inset-0 bg-black/30"
        style={{
          background: 'linear-gradient(135deg, rgba(45, 27, 105, 0.4) 0%, rgba(75, 58, 159, 0.3) 100%)'
        }}
      />
      
      {/* Attribution */}
      {showAttribution && videoUrl.includes('pexels.com') && (
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/70 hover:text-white/90 bg-black/50 px-2 py-1 rounded backdrop-blur-sm transition-colors"
          >
            Video by Pexels
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoBackground;
