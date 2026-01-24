-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for progress-photos bucket
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create progress_photos table
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'during', 'after')),
  storage_path TEXT NOT NULL,
  caption TEXT,
  week_number INTEGER,
  privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('private', 'coach_only', 'public')),
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_photos
CREATE POLICY "Users can view their own photos"
ON public.progress_photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos"
ON public.progress_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
ON public.progress_photos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.progress_photos FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view coach_only and public photos"
ON public.progress_photos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role) AND privacy_level IN ('coach_only', 'public'));

-- Create discipline_templates table for preset routines
CREATE TABLE public.discipline_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'beginner', 'advanced', 'military', 'faith_focused')),
  routines JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discipline_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access for templates
CREATE POLICY "Anyone can view active templates"
ON public.discipline_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage templates"
ON public.discipline_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default discipline templates
INSERT INTO public.discipline_templates (name, description, category, routines, display_order) VALUES
(
  '5 AM Warrior',
  'Military-style early morning discipline routine for maximum productivity',
  'military',
  '[
    {"routine_type": "morning", "time_slot": "5:00 AM", "action_text": "Wake up - No snooze, feet on floor", "display_order": 0},
    {"routine_type": "morning", "time_slot": "5:05 AM", "action_text": "Cold shower - 2 minutes minimum", "display_order": 1},
    {"routine_type": "morning", "time_slot": "5:15 AM", "action_text": "Scripture reading - 15 minutes", "display_order": 2},
    {"routine_type": "morning", "time_slot": "5:30 AM", "action_text": "Prayer and meditation", "display_order": 3},
    {"routine_type": "morning", "time_slot": "5:45 AM", "action_text": "Physical training", "display_order": 4},
    {"routine_type": "morning", "time_slot": "6:30 AM", "action_text": "Healthy breakfast", "display_order": 5},
    {"routine_type": "evening", "time_slot": "8:00 PM", "action_text": "Review today''s wins and lessons", "display_order": 0},
    {"routine_type": "evening", "time_slot": "8:30 PM", "action_text": "Prepare tomorrow''s priorities", "display_order": 1},
    {"routine_type": "evening", "time_slot": "9:00 PM", "action_text": "No screens - read or journal", "display_order": 2},
    {"routine_type": "evening", "time_slot": "9:30 PM", "action_text": "Prayer and gratitude", "display_order": 3},
    {"routine_type": "evening", "time_slot": "10:00 PM", "action_text": "Lights out", "display_order": 4}
  ]'::jsonb,
  1
),
(
  'Beginner Block',
  'Simple starting routine for those new to discipline',
  'beginner',
  '[
    {"routine_type": "morning", "time_slot": "6:00 AM", "action_text": "Wake up at the same time", "display_order": 0},
    {"routine_type": "morning", "time_slot": "6:15 AM", "action_text": "Make your bed", "display_order": 1},
    {"routine_type": "morning", "time_slot": "6:30 AM", "action_text": "10 minutes of movement", "display_order": 2},
    {"routine_type": "morning", "time_slot": "6:45 AM", "action_text": "Healthy breakfast", "display_order": 3},
    {"routine_type": "evening", "time_slot": "9:00 PM", "action_text": "Review the day", "display_order": 0},
    {"routine_type": "evening", "time_slot": "9:30 PM", "action_text": "Put phone away", "display_order": 1},
    {"routine_type": "evening", "time_slot": "10:00 PM", "action_text": "Lights out", "display_order": 2}
  ]'::jsonb,
  2
),
(
  'Faith Foundation',
  'Scripture-centered routine for spiritual transformation',
  'faith_focused',
  '[
    {"routine_type": "morning", "time_slot": "5:30 AM", "action_text": "Wake with gratitude prayer", "display_order": 0},
    {"routine_type": "morning", "time_slot": "5:45 AM", "action_text": "Bible study - 30 minutes", "display_order": 1},
    {"routine_type": "morning", "time_slot": "6:15 AM", "action_text": "Prayer and intercession", "display_order": 2},
    {"routine_type": "morning", "time_slot": "6:30 AM", "action_text": "Journal insights and commitments", "display_order": 3},
    {"routine_type": "morning", "time_slot": "6:45 AM", "action_text": "Memorize one verse", "display_order": 4},
    {"routine_type": "evening", "time_slot": "8:00 PM", "action_text": "Evening devotional", "display_order": 0},
    {"routine_type": "evening", "time_slot": "8:30 PM", "action_text": "Confession and repentance", "display_order": 1},
    {"routine_type": "evening", "time_slot": "9:00 PM", "action_text": "Pray for others", "display_order": 2},
    {"routine_type": "evening", "time_slot": "9:30 PM", "action_text": "Read Psalms or Proverbs", "display_order": 3}
  ]'::jsonb,
  3
),
(
  'Iron Sharpens Iron',
  'Advanced discipline routine for seasoned warriors',
  'advanced',
  '[
    {"routine_type": "morning", "time_slot": "4:30 AM", "action_text": "Rise - No excuses, no delays", "display_order": 0},
    {"routine_type": "morning", "time_slot": "4:35 AM", "action_text": "Cold exposure - 3+ minutes", "display_order": 1},
    {"routine_type": "morning", "time_slot": "4:45 AM", "action_text": "Deep prayer session", "display_order": 2},
    {"routine_type": "morning", "time_slot": "5:00 AM", "action_text": "Scripture study and memorization", "display_order": 3},
    {"routine_type": "morning", "time_slot": "5:30 AM", "action_text": "Heavy training session", "display_order": 4},
    {"routine_type": "morning", "time_slot": "6:30 AM", "action_text": "Cold shower finish", "display_order": 5},
    {"routine_type": "morning", "time_slot": "6:45 AM", "action_text": "High protein meal prep", "display_order": 6},
    {"routine_type": "evening", "time_slot": "7:00 PM", "action_text": "Review and plan tomorrow", "display_order": 0},
    {"routine_type": "evening", "time_slot": "7:30 PM", "action_text": "Accountability text to brother", "display_order": 1},
    {"routine_type": "evening", "time_slot": "8:00 PM", "action_text": "Evening devotional", "display_order": 2},
    {"routine_type": "evening", "time_slot": "8:30 PM", "action_text": "Journal wins and lessons", "display_order": 3},
    {"routine_type": "evening", "time_slot": "9:00 PM", "action_text": "Screens off, prepare for rest", "display_order": 4},
    {"routine_type": "evening", "time_slot": "9:30 PM", "action_text": "Lights out - No exceptions", "display_order": 5}
  ]'::jsonb,
  4
);

-- Create email_notification_logs table to track sent notifications
CREATE TABLE public.email_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('check_in_reminder', 'streak_alert', 'weekly_update', 'milestone', 'welcome')),
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_notification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view notification logs
CREATE POLICY "Admins can view all notification logs"
ON public.email_notification_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "System can insert logs"
ON public.email_notification_logs FOR INSERT
WITH CHECK (true);

-- Add index for notification queries
CREATE INDEX idx_notification_logs_user_type ON public.email_notification_logs(user_id, notification_type);
CREATE INDEX idx_notification_logs_created ON public.email_notification_logs(created_at DESC);
CREATE INDEX idx_progress_photos_user ON public.progress_photos(user_id, photo_type);