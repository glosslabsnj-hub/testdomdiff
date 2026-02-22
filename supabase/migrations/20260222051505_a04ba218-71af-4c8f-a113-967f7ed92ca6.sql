ALTER TABLE public.social_content_calendar
  ADD COLUMN IF NOT EXISTS hook text,
  ADD COLUMN IF NOT EXISTS talking_points jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS filming_tips text,
  ADD COLUMN IF NOT EXISTS cta text,
  ADD COLUMN IF NOT EXISTS strategy_type text,
  ADD COLUMN IF NOT EXISTS category text;