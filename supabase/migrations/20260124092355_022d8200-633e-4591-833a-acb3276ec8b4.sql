-- =====================================================
-- User Routine Time Overrides (allow users to customize their schedule times)
-- =====================================================
CREATE TABLE public.user_routine_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES discipline_templates(id) ON DELETE CASCADE,
  routine_index INTEGER NOT NULL,
  custom_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id, routine_index)
);

ALTER TABLE public.user_routine_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time overrides"
  ON public.user_routine_times FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time overrides"
  ON public.user_routine_times FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time overrides"
  ON public.user_routine_times FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time overrides"
  ON public.user_routine_times FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Community Channels (Discord-like structure)
-- =====================================================
CREATE TABLE public.community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'hash',
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  min_tier TEXT DEFAULT 'membership',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active channels
CREATE POLICY "Authenticated users can view channels"
  ON public.community_channels FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can manage channels
CREATE POLICY "Admins can manage channels"
  ON public.community_channels FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Community Messages
-- =====================================================
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES community_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view messages
CREATE POLICY "Authenticated users can view messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON public.community_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own messages, admins can delete any
CREATE POLICY "Users can delete own messages"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- =====================================================
-- Seed default community channels
-- =====================================================
INSERT INTO public.community_channels (name, description, icon, category, display_order, min_tier) VALUES
  ('general', 'General discussion and introductions', 'users', 'Main', 1, 'membership'),
  ('wins', 'Share your victories and celebrate progress', 'trophy', 'Main', 2, 'membership'),
  ('prayer-requests', 'Prayer needs and spiritual support', 'heart', 'Faith', 3, 'membership'),
  ('workout-questions', 'Form checks, exercise questions, and training tips', 'dumbbell', 'Training', 4, 'membership'),
  ('nutrition-talk', 'Meal prep, recipes, and nutrition questions', 'utensils', 'Training', 5, 'transformation'),
  ('accountability', 'Daily check-ins and accountability partners', 'shield', 'Growth', 6, 'transformation'),
  ('free-world-lounge', 'Exclusive discussion for coaching members', 'crown', 'Premium', 7, 'coaching');