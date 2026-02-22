
-- Social Profile Audits
CREATE TABLE public.social_profile_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  audit_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_items text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.social_profile_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage social profile audits"
ON public.social_profile_audits FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Social Content Calendar
CREATE TABLE public.social_content_calendar (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_date date NOT NULL,
  platform text NOT NULL,
  content_post_id uuid REFERENCES public.content_engine_posts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.social_content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage social content calendar"
ON public.social_content_calendar FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Social Trend Scans
CREATE TABLE public.social_trend_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  trends jsonb NOT NULL DEFAULT '[]'::jsonb,
  scanned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.social_trend_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage social trend scans"
ON public.social_trend_scans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
