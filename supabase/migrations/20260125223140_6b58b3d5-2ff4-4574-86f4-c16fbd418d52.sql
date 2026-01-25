-- Create site_settings table for storing admin-configurable settings (pixel IDs, Calendly URL, etc.)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage site settings
CREATE POLICY "Admins can view site settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('meta_pixel_id', '', 'Facebook/Meta Pixel ID for conversion tracking'),
  ('ga4_measurement_id', '', 'Google Analytics 4 Measurement ID'),
  ('tiktok_pixel_id', '', 'TikTok Pixel ID for conversion tracking'),
  ('calendly_url', 'https://calendly.com/your-link', 'Calendly booking page URL'),
  ('support_email', 'support@domdifferent.com', 'Primary support email address');