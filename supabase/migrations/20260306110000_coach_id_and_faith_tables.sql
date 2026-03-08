-- 1. Add coach_user_id to site_settings (will be set to Dom's real ID after he creates an account)
INSERT INTO public.site_settings (key, value, description) VALUES
  ('coach_user_id', '', 'The auth.users UUID of the head coach (Dom). Set this after Dom creates his account.')
ON CONFLICT (key) DO NOTHING;

-- 2. Allow authenticated users to read non-sensitive site settings
--    (coach_user_id, calendly_url, support_email are needed by client-side code)
CREATE POLICY "Authenticated users can read public settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (key IN ('coach_user_id', 'calendly_url', 'support_email'));

-- 3. Faith progress table (replaces localStorage for journal, actions, reflections per week)
CREATE TABLE IF NOT EXISTS public.faith_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  journal_entry text,
  completed_actions jsonb DEFAULT '[]'::jsonb,
  reflection_answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_number)
);

ALTER TABLE public.faith_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own faith progress"
  ON public.faith_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own faith progress"
  ON public.faith_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own faith progress"
  ON public.faith_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all faith progress"
  ON public.faith_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_faith_progress_updated_at
  BEFORE UPDATE ON public.faith_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Faith prayers table (replaces localStorage prayer list)
CREATE TABLE IF NOT EXISTS public.faith_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.faith_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayers"
  ON public.faith_prayers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers"
  ON public.faith_prayers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON public.faith_prayers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers"
  ON public.faith_prayers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all prayers"
  ON public.faith_prayers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Faith memorized scriptures (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.faith_memorized (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  memorized_at timestamptz DEFAULT now(),
  PRIMARY KEY(user_id, week_number)
);

ALTER TABLE public.faith_memorized ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memorized"
  ON public.faith_memorized FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memorized"
  ON public.faith_memorized FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memorized"
  ON public.faith_memorized FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memorized"
  ON public.faith_memorized FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
