-- Add stripe_customer_id to profiles for fast lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Stripe webhook event log for idempotent processing
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY, -- Stripe event ID (evt_...)
  type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data JSONB
);

-- RLS for stripe_events (admin only)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage stripe events"
ON public.stripe_events FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Workout personalizations table for AI-enhanced workout assignment
CREATE TABLE IF NOT EXISTS public.workout_personalizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  personalized_exercises JSONB NOT NULL,
  modification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id, week_number, day_of_week)
);

-- RLS for workout_personalizations (users can read their own)
ALTER TABLE public.workout_personalizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own workout personalizations"
ON public.workout_personalizations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage workout personalizations"
ON public.workout_personalizations FOR ALL
USING (true)
WITH CHECK (true);
