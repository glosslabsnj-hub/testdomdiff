-- Create content_engine_posts table for storing generated content ideas
CREATE TABLE public.content_engine_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('faith', 'discipline', 'training', 'transformations', 'authority', 'platform')),
  mode TEXT NOT NULL CHECK (mode IN ('done_for_you', 'freestyle')),
  title TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  format TEXT,
  hook TEXT NOT NULL,
  talking_points JSONB NOT NULL DEFAULT '[]',
  filming_tips TEXT,
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'fresh' CHECK (status IN ('fresh', 'used', 'favorite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_engine_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can access
CREATE POLICY "Admins can view all content posts"
ON public.content_engine_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create content posts"
ON public.content_engine_posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content posts"
ON public.content_engine_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content posts"
ON public.content_engine_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_engine_posts_updated_at
BEFORE UPDATE ON public.content_engine_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();