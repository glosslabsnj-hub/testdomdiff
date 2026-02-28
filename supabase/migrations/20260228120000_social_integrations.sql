-- Social Integrations: Instagram insights, viral research, content scripts
-- Created: 2026-02-28

-- ─────────────────────────────────────────────────────────────────
-- Instagram Insights (cached Apify data)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.instagram_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_handle TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage instagram_insights"
  ON public.instagram_insights FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role - instagram_insights"
  ON public.instagram_insights FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- Viral Research Results (cached FireCrawl data)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.viral_research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT,
  research_type TEXT NOT NULL DEFAULT 'general',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.viral_research_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage viral_research_results"
  ON public.viral_research_results FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role - viral_research"
  ON public.viral_research_results FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- Content Scripts (detailed step-by-step scripts)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_post_id UUID REFERENCES public.content_engine_posts(id) ON DELETE SET NULL,
  script_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  platform TEXT NOT NULL DEFAULT 'instagram',
  title TEXT,
  content_type TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content_scripts"
  ON public.content_scripts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role - content_scripts"
  ON public.content_scripts FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_instagram_insights_handle ON public.instagram_insights(profile_handle);
CREATE INDEX IF NOT EXISTS idx_instagram_insights_expires ON public.instagram_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_scripts_post_id ON public.content_scripts(content_post_id);
CREATE INDEX IF NOT EXISTS idx_viral_research_type ON public.viral_research_results(research_type);
