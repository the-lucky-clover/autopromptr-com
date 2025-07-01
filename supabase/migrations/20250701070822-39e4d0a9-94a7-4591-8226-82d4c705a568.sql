
-- Add language preferences for multilingual greetings (skip name as it already exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Add video background preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_background_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_background_opacity INTEGER DEFAULT 85;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_background_blend_mode TEXT DEFAULT 'multiply';
