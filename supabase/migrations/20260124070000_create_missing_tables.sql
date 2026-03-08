-- Create tables that were originally created via the Supabase dashboard
-- and are missing from migration files

-- 1. discipline_journals - Private journal entries for discipline tracking
CREATE TABLE IF NOT EXISTS public.discipline_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.discipline_journals ENABLE ROW LEVEL SECURITY;

-- 2. user_milestones - Track user achievements and badges
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_milestones (discipline_journals policies are created in a later migration)
CREATE POLICY "users_view_own_milestones"
ON public.user_milestones FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_create_own_milestones"
ON public.user_milestones FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_milestones"
ON public.user_milestones FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
