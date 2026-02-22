
CREATE TABLE public.social_command_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_completed boolean NOT NULL DEFAULT false,
  instagram_handle text,
  tiktok_handle text,
  youtube_handle text,
  twitter_handle text,
  posting_cadence jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_pillars text[] NOT NULL DEFAULT '{}'::text[],
  brand_voice_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.social_command_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage social command config"
ON public.social_command_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
