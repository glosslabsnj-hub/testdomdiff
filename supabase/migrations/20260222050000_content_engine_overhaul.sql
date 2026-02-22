-- Content Engine Overhaul: Dynamic Brand Voice
-- Adds personality data, master prompt storage, API usage tracking, and competitor analysis

-- Extend social_command_config with brand voice fields
ALTER TABLE public.social_command_config
  ADD COLUMN IF NOT EXISTS personality_answers JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS generated_master_prompt TEXT,
  ADD COLUMN IF NOT EXISTS master_prompt_version INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS master_prompt_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS competitor_handles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS existing_content_samples TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_voice_analysis TEXT;

-- API usage tracking for cost controls
CREATE TABLE IF NOT EXISTS public.social_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost_cents NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view api usage"
ON public.social_api_usage FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert api usage"
ON public.social_api_usage FOR INSERT WITH CHECK (true);

-- Competitor analysis history
CREATE TABLE IF NOT EXISTS public.social_competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_handle TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  analysis_data JSONB NOT NULL DEFAULT '{}',
  pasted_content TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_competitor_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage competitor analyses"
ON public.social_competitor_analyses FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
