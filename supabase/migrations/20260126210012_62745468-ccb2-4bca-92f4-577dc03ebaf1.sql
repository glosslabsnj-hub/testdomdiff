-- Add walkthrough_audio_url column to program_welcome_videos
ALTER TABLE program_welcome_videos 
ADD COLUMN walkthrough_audio_url TEXT;