-- Create a new table for week-specific workout days
-- This allows Dom to create custom named workouts for each day of each week
CREATE TABLE public.program_day_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.program_weeks(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  workout_name TEXT NOT NULL,
  workout_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_id, day_of_week)
);

-- Create exercises specific to program day workouts
CREATE TABLE public.program_day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_workout_id UUID NOT NULL REFERENCES public.program_day_workouts(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('warmup', 'main', 'finisher', 'cooldown')),
  exercise_name TEXT NOT NULL,
  sets TEXT,
  reps_or_time TEXT,
  rest TEXT,
  notes TEXT,
  scaling_options TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_day_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_day_exercises ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can manage, authenticated users can read
CREATE POLICY "Admins can manage program day workouts"
ON public.program_day_workouts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view program day workouts"
ON public.program_day_workouts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage program day exercises"
ON public.program_day_exercises
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view program day exercises"
ON public.program_day_exercises
FOR SELECT
TO authenticated
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_program_day_workouts_updated_at
BEFORE UPDATE ON public.program_day_workouts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_day_exercises_updated_at
BEFORE UPDATE ON public.program_day_exercises
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();