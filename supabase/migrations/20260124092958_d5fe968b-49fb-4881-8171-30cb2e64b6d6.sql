-- Add welcome_video_url columns to store tier-specific welcome videos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_video_watched BOOLEAN DEFAULT false;

-- Create table to store tier-specific welcome videos (admin can set these)
CREATE TABLE IF NOT EXISTS program_welcome_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('membership', 'transformation', 'coaching')),
  video_url TEXT,
  video_title TEXT DEFAULT 'Welcome to the Program',
  video_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE program_welcome_videos ENABLE ROW LEVEL SECURITY;

-- Everyone can read welcome videos
CREATE POLICY "Welcome videos are publicly readable"
  ON program_welcome_videos FOR SELECT
  USING (true);

-- Only admins can modify welcome videos
CREATE POLICY "Only admins can manage welcome videos"
  ON program_welcome_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Seed default entries for each tier
INSERT INTO program_welcome_videos (plan_type, video_title, video_description)
VALUES 
  ('membership', 'Welcome to Solitary Confinement', 'Your journey to discipline starts now.'),
  ('transformation', 'Welcome to General Population', 'You''ve committed to the 12-week sentence. Let''s transform.'),
  ('coaching', 'Welcome to Free World', 'Direct access, maximum accountability. Let''s build your legacy.')
ON CONFLICT (plan_type) DO NOTHING;