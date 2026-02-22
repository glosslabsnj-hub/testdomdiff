-- Social Command Center: new tables + alter content_engine_posts

-- 1. social_command_config — Dom's social media setup + onboarding state
CREATE TABLE public.social_command_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  twitter_handle TEXT,
  posting_cadence JSONB NOT NULL DEFAULT '{}',
  content_pillars JSONB NOT NULL DEFAULT '[]',
  brand_voice_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_command_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view social config"
ON public.social_command_config FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert social config"
ON public.social_command_config FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social config"
ON public.social_command_config FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_social_command_config_updated_at
BEFORE UPDATE ON public.social_command_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. social_content_calendar — Content calendar slots
CREATE TABLE public.social_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  content_type TEXT,
  content_post_id UUID REFERENCES public.content_engine_posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'drafted', 'recorded', 'posted', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view calendar"
ON public.social_content_calendar FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert calendar"
ON public.social_content_calendar FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update calendar"
ON public.social_content_calendar FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calendar"
ON public.social_content_calendar FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_social_content_calendar_updated_at
BEFORE UPDATE ON public.social_content_calendar
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. social_profile_audits — AI profile audit results
CREATE TABLE public.social_profile_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  audit_data JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  recommendations JSONB NOT NULL DEFAULT '[]',
  completed_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_profile_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audits"
ON public.social_profile_audits FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audits"
ON public.social_profile_audits FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update audits"
ON public.social_profile_audits FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete audits"
ON public.social_profile_audits FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_social_profile_audits_updated_at
BEFORE UPDATE ON public.social_profile_audits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. social_trend_scans — Cached trend analysis
CREATE TABLE public.social_trend_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  trends JSONB NOT NULL DEFAULT '[]',
  content_angles JSONB NOT NULL DEFAULT '[]',
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE public.social_trend_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view trend scans"
ON public.social_trend_scans FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert trend scans"
ON public.social_trend_scans FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trend scans"
ON public.social_trend_scans FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Alter content_engine_posts — add new columns
-- Drop and recreate the category CHECK to include story + culture
ALTER TABLE public.content_engine_posts DROP CONSTRAINT IF EXISTS content_engine_posts_category_check;
ALTER TABLE public.content_engine_posts ADD CONSTRAINT content_engine_posts_category_check
  CHECK (category IN ('faith', 'discipline', 'training', 'transformations', 'authority', 'platform', 'story', 'culture'));

ALTER TABLE public.content_engine_posts ADD COLUMN IF NOT EXISTS strategy_type TEXT;
ALTER TABLE public.content_engine_posts ADD COLUMN IF NOT EXISTS hashtags TEXT[];
ALTER TABLE public.content_engine_posts ADD COLUMN IF NOT EXISTS why_it_works TEXT;
ALTER TABLE public.content_engine_posts ADD COLUMN IF NOT EXISTS target_platform TEXT;
ALTER TABLE public.content_engine_posts ADD COLUMN IF NOT EXISTS content_type TEXT;
