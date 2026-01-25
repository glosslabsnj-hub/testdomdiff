-- Create tier_onboarding_videos table for storing generated onboarding videos per tier
CREATE TABLE public.tier_onboarding_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key TEXT NOT NULL CHECK (tier_key IN ('membership', 'transformation', 'coaching')),
  tier_config_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'generating_script', 'generating_audio', 'generating_captions', 'ready', 'failed')),
  script_text TEXT,
  caption_lines JSONB,
  voice_id TEXT DEFAULT 'whW3u9nCRzIXd1EfN1YN',
  audio_url TEXT,
  captions_srt_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tier_key, tier_config_version)
);

-- Enable RLS
ALTER TABLE public.tier_onboarding_videos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view onboarding videos (read-only)
CREATE POLICY "Authenticated users can view onboarding videos"
  ON public.tier_onboarding_videos FOR SELECT
  TO authenticated USING (true);

-- Admins can manage onboarding videos
CREATE POLICY "Admins can insert onboarding videos"
  ON public.tier_onboarding_videos FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update onboarding videos"
  ON public.tier_onboarding_videos FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete onboarding videos"
  ON public.tier_onboarding_videos FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow service role to manage (for edge functions)
CREATE POLICY "Service role can manage onboarding videos"
  ON public.tier_onboarding_videos FOR ALL
  TO service_role USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_tier_onboarding_videos_updated_at
  BEFORE UPDATE ON public.tier_onboarding_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add tier_config_version to site_settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('tier_config_version', '1', 'Increment when tier features change to regenerate onboarding videos')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for onboarding assets
INSERT INTO storage.buckets (id, name, public) VALUES ('onboarding-assets', 'onboarding-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for onboarding assets
CREATE POLICY "Anyone can view onboarding assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'onboarding-assets');

CREATE POLICY "Service role can manage onboarding assets"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'onboarding-assets');