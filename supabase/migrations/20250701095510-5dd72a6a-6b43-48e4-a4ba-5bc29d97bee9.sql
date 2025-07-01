
-- Update default video settings in profiles table
ALTER TABLE public.profiles 
ALTER COLUMN video_background_url SET DEFAULT 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4';

ALTER TABLE public.profiles 
ALTER COLUMN video_background_opacity SET DEFAULT 85;

ALTER TABLE public.profiles 
ALTER COLUMN video_background_blend_mode SET DEFAULT 'multiply';

-- Update existing records to use new defaults if they still have old values
UPDATE public.profiles 
SET video_background_url = 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4'
WHERE video_background_url = 'https://videos.pexels.com/video-files/10182004/10182004-uhd_2560_1440_25fps.mp4';

UPDATE public.profiles 
SET video_background_opacity = 85
WHERE video_background_opacity = 100;

UPDATE public.profiles 
SET video_background_blend_mode = 'multiply'
WHERE video_background_blend_mode = 'normal';
