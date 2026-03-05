-- Coaching plan options: AI generates multiple approaches for Dom to choose from
CREATE TABLE IF NOT EXISTS public.coaching_plan_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'meal')),
  option_number INTEGER NOT NULL CHECK (option_number BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
  approach_title TEXT NOT NULL,
  approach_summary TEXT NOT NULL,
  sample_week_overview JSONB,
  key_differentiators TEXT[],
  full_plan_data JSONB, -- populated only after approval and full generation
  dom_notes TEXT, -- Dom can add notes when approving
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, plan_type, option_number)
);

-- RLS
ALTER TABLE public.coaching_plan_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own approved coaching options"
ON public.coaching_plan_options FOR SELECT
USING (auth.uid() = user_id AND status = 'approved');

CREATE POLICY "Admins can manage all coaching options"
ON public.coaching_plan_options FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access coaching options"
ON public.coaching_plan_options FOR ALL
USING (true)
WITH CHECK (true);

-- Index for quick admin lookups
CREATE INDEX idx_coaching_plan_options_status ON public.coaching_plan_options(status);
CREATE INDEX idx_coaching_plan_options_user ON public.coaching_plan_options(user_id);

-- Add coaching_plan_status to profiles for dashboard awareness
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coaching_plan_status TEXT DEFAULT 'none' CHECK (coaching_plan_status IN ('none', 'generating', 'pending_review', 'approved'));
