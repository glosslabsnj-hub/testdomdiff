ALTER TABLE public.social_content_calendar 
  ADD COLUMN IF NOT EXISTS content_type text,
  ADD COLUMN IF NOT EXISTS day_of_week integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_slot text DEFAULT 'morning',
  ADD COLUMN IF NOT EXISTS title text DEFAULT '';