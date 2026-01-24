-- Create program tracks table for goal-based 12-week programs
CREATE TABLE public.program_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  goal_match TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add track_id to program_weeks
ALTER TABLE public.program_weeks ADD COLUMN track_id UUID REFERENCES public.program_tracks(id) ON DELETE SET NULL;

-- Enable RLS on program_tracks
ALTER TABLE public.program_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for program_tracks
CREATE POLICY "Anyone can view active program tracks"
ON public.program_tracks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage program tracks"
ON public.program_tracks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on program_tracks
CREATE TRIGGER update_program_tracks_updated_at
BEFORE UPDATE ON public.program_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tracks based on common goals
INSERT INTO public.program_tracks (name, slug, description, goal_match, display_order) VALUES
('Fat Loss', 'fat-loss', 'High-intensity training focused on burning fat while preserving muscle', 'Lose fat', 1),
('Muscle Building', 'muscle-building', 'Progressive overload training focused on hypertrophy and strength gains', 'Build muscle', 2),
('Recomposition', 'recomposition', 'Balanced approach to simultaneously build muscle and lose fat', 'Both - lose fat and build muscle', 3);

-- Update existing weeks to link to the first track (Fat Loss) as default
UPDATE public.program_weeks SET track_id = (SELECT id FROM public.program_tracks WHERE slug = 'fat-loss' LIMIT 1);