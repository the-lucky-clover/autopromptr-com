
-- Add video_background_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN video_background_url TEXT DEFAULT 'https://videos.pexels.com/video-files/10182004/10182004-uhd_2560_1440_25fps.mp4';
