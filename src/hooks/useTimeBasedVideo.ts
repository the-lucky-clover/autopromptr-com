
import { useState, useEffect } from 'react';

interface TimeBasedVideo {
  url: string;
  attribution: string;
  period: 'morning' | 'afternoon' | 'evening' | 'custom';
}

const TIME_BASED_VIDEOS: TimeBasedVideo[] = [
  {
    period: 'morning',
    url: 'https://videos.pexels.com/video-files/20649226/20649226-uhd_2560_1440_30fps.mp4',
    attribution: 'https://www.pexels.com/video/timelapse-of-sunrise-over-mountain-lake-20649226/'
  },
  {
    period: 'afternoon', 
    url: 'https://videos.pexels.com/video-files/10182004/10182004-hd_2160_1440_24fps.mp4',
    attribution: 'https://www.pexels.com/video/time-lapse-of-city-at-night-10182004/'
  },
  {
    period: 'evening',
    url: 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4', 
    attribution: 'https://www.pexels.com/video/time-lapse-video-of-aurora-borealis-852435/'
  }
];

export const useTimeBasedVideo = (userVideoUrl?: string) => {
  // Initialize with a safe default
  const getInitialVideo = () => {
    if (userVideoUrl) {
      return {
        period: 'custom' as const,
        url: userVideoUrl,
        attribution: userVideoUrl.includes('pexels.com') 
          ? userVideoUrl.replace(/video-files.*/, '') 
          : ''
      };
    }
    return TIME_BASED_VIDEOS[2]; // Default to evening video
  };
  
  const [currentVideo, setCurrentVideo] = useState<TimeBasedVideo>(getInitialVideo);

  useEffect(() => {
    if (userVideoUrl) {
      // If user has set a permanent video, use that
      setCurrentVideo({
        period: 'custom',
        url: userVideoUrl,
        attribution: userVideoUrl.includes('pexels.com') 
          ? userVideoUrl.replace(/video-files.*/, '') 
          : ''
      });
      return;
    }

    const updateVideoByTime = () => {
      const hour = new Date().getHours();
      let selectedVideo: TimeBasedVideo;

      if (hour >= 5 && hour < 12) {
        selectedVideo = TIME_BASED_VIDEOS[0]; // morning
      } else if (hour >= 12 && hour < 18) {
        selectedVideo = TIME_BASED_VIDEOS[1]; // afternoon  
      } else {
        selectedVideo = TIME_BASED_VIDEOS[2]; // evening
      }

      console.log(`Time-based video selection: ${hour}:00 -> ${selectedVideo.period} video`);
      setCurrentVideo(selectedVideo);
    };

    updateVideoByTime();
    const interval = setInterval(updateVideoByTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [userVideoUrl]);

  return currentVideo;
};
