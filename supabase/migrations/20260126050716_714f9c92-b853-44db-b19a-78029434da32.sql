-- Add mp4_url column to tier_onboarding_videos for storing generated video URL
ALTER TABLE public.tier_onboarding_videos 
ADD COLUMN IF NOT EXISTS mp4_url TEXT;

-- Add video slide data for rendering
ALTER TABLE public.tier_onboarding_videos 
ADD COLUMN IF NOT EXISTS slides JSONB;

-- Add onboarding_video_watched to profiles to track first-login video completion
-- Note: dashboard_video_watched already exists but we need a separate flag for the new video modal
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_login_video_watched BOOLEAN DEFAULT FALSE;