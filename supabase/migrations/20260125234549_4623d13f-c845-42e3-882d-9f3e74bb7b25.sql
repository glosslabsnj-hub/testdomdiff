-- Add voice_map to site_settings for tier-based voice selection
INSERT INTO site_settings (key, value, description) VALUES
  ('voice_map', '{"onboarding":"YtCzf4XXIC5vu5YfIjoP","po":"4bOoBAdJb8z9qH6OY0IA","warden":"whW3u9nCRzIXd1EfN1YN"}', 
   'ElevenLabs voice IDs: onboarding (Solitary/Gen Pop videos), po (Coaching videos), warden (briefs/tips)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

-- Add screen_slides column to store visual sync data for video playback
ALTER TABLE tier_onboarding_videos 
ADD COLUMN IF NOT EXISTS screen_slides JSONB;

-- Add voice_id column to track which voice was used for each video
ALTER TABLE tier_onboarding_videos 
ADD COLUMN IF NOT EXISTS voice_id TEXT;

-- Add dashboard_video_watched to profiles for tracking first-view state
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dashboard_video_watched BOOLEAN DEFAULT false;