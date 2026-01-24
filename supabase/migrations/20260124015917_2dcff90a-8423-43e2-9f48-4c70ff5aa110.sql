-- Add bodyweight flag and video support to workout_templates
ALTER TABLE workout_templates 
ADD COLUMN is_bodyweight BOOLEAN DEFAULT false,
ADD COLUMN video_url TEXT;

-- Add video support to program_weeks
ALTER TABLE program_weeks
ADD COLUMN video_url TEXT,
ADD COLUMN video_title TEXT,
ADD COLUMN video_description TEXT;

-- Create skill_lessons table for money-making skill content
CREATE TABLE skill_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  action_steps TEXT,
  resources JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  is_advanced BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on skill_lessons
ALTER TABLE skill_lessons ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view published skill lessons
CREATE POLICY "Authenticated users can view published skill lessons"
ON skill_lessons FOR SELECT
USING (is_published = true);

-- Admins can manage skill lessons
CREATE POLICY "Admins can manage skill lessons"
ON skill_lessons FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create direct_messages table for coaching tier DMs
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark their received messages as read
CREATE POLICY "Users can update their received messages"
ON direct_messages FOR UPDATE
USING (auth.uid() = recipient_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON direct_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for direct_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Add trigger for updated_at on skill_lessons
CREATE TRIGGER update_skill_lessons_updated_at
BEFORE UPDATE ON skill_lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();