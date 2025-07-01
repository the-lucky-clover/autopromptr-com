
import React, { useState, useEffect, useRef } from 'react';
import { Radiation } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

const AnimatedDropdownClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [meltdownVideo, setMeltdownVideo] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Show dropdown after component mounts
    setTimeout(() => setIsDropdownVisible(true), 500);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      console.log('🚨 SECTOR 7G REACTOR MELTDOWN INITIATED! 🚨');
      setShowMeltdown(true);
      
      // Create and play the meltdown video
      const video = document.createElement('video');
      video.src = '/sounds/sector7g-meltdown.mp4'; // You'll need to add this clip
      video.autoplay = true;
      video.muted = false;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100vw';
      video.style.height = '100vh';
      video.style.objectFit = 'cover';
      video.style.zIndex = '9999';
      video.style.backgroundColor = 'black';
      
      // Add fade-in effect
      video.style.opacity = '0';
      video.style.transition = 'opacity 0.5s ease-in-out';
      
      document.body.appendChild(video);
      setMeltdownVideo(video);
      
      // Fade in the video
      setTimeout(() => {
        video.style.opacity = '1';
      }, 100);
      
      // Stop video at reactor doors closing and dissolve away
      video.addEventListener('timeupdate', () => {
        if (video.currentTime >= 4) { // 4 second clip
          video.pause();
          
          // Dissolve away after 1 second pause
          setTimeout(() => {
            video.style.opacity = '0';
            setTimeout(() => {
              document.body.removeChild(video);
              setShowMeltdown(false);
              setMeltdownVideo(null);
            }, 500);
          }, 1000);
        }
      });
      
      video.addEventListener('error', () => {
        console.log('Video not available, using fallback effect');
        // Fallback to original alarm effect
        setTimeout(() => {
          setShowMeltdown(false);
          if (video.parentNode) {
            document.body.removeChild(video);
          }
        }, 3000);
      });
    }, 15000); // 15 seconds hover trigger
    
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  const formatDate = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${day} ${date}`;
  };

  return (
    <>
      {/* Meltdown Visual Effects */}
      {showMeltdown && !meltdownVideo && (
        <>
          <div className="fixed inset-0 z-[9998] bg-red-600 opacity-50 animate-pulse pointer-events-none" />
          
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9997] flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-24 bg-red-500 rounded-b-full animate-spin shadow-lg shadow-red-500/50"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.3s'
                }}
              />
            ))}
          </div>
          
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9997] bg-red-900/90 backdrop-blur-sm border-2 border-red-500 rounded-lg p-6 animate-pulse">
            <p className="text-red-300 font-mono text-2xl font-bold text-center">
              ⚠️ REACTOR MELTDOWN IMMINENT ⚠️
            </p>
            <p className="text-red-400 font-mono text-lg text-center mt-2">
              Springfield Nuclear Power Plant - Sector 7G
            </p>
          </div>
        </>
      )}

      {/* Glowing Radioactive Symbol - Upper Left */}
      <div className="fixed top-4 left-4 z-50 pointer-events-none">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/40 flex items-center justify-center animate-pulse">
            <Radiation className="w-5 h-5 text-yellow-400 animate-pulse" style={{
              filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
          
          {/* Glow ring effect */}
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-yellow-400/10 animate-ping" />
        </div>
      </div>

      {/* Animated Glass Dropdown Clock */}
      <div 
        className={`fixed top-0 right-6 z-40 transition-all duration-700 ease-out ${
          isDropdownVisible ? 'translate-y-6' : '-translate-y-full'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bg-black/20 backdrop-blur-md rounded-b-xl p-4 border border-white/20 border-t-0 shadow-2xl">
          <div className="flex items-center space-x-3 text-white">
            <div className="text-left">
              <div className="text-xs text-yellow-400/80 font-sans uppercase tracking-wider font-semibold">
                SECTOR 7G
              </div>
              <div className="font-sans font-medium leading-tight text-sm text-white/90">
                {formatDate()} • {currentTime} {getTimezoneAbbr()}
              </div>
              <div className="text-xs text-green-400/60 font-sans mt-1">
                ● REACTOR STABLE
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedDropdownClock;
