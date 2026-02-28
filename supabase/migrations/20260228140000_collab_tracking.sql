-- Collab Tracking: prospect management for Dom's growth strategy
-- Created: 2026-02-28

CREATE TABLE IF NOT EXISTS public.collab_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  name TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  follower_count INTEGER,
  niche TEXT,
  status TEXT NOT NULL DEFAULT 'prospect'
    CHECK (status IN ('prospect', 'researching', 'reached_out', 'responded', 'confirmed', 'completed', 'passed')),
  outreach_dm TEXT,
  collab_idea TEXT,
  notes TEXT,
  contact_info TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collab_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collab_prospects"
  ON public.collab_prospects FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role - collab_prospects"
  ON public.collab_prospects FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_collab_prospects_status ON public.collab_prospects(status);
CREATE INDEX IF NOT EXISTS idx_collab_prospects_platform ON public.collab_prospects(platform);
