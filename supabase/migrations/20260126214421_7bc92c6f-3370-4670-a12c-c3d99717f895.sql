-- Client Program Weeks (4 weeks per client)
CREATE TABLE public.client_program_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 4),
  title TEXT,
  focus_description TEXT,
  phase TEXT DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (client_id, week_number)
);

-- Client Program Days (7 days per week)
CREATE TABLE public.client_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.client_program_weeks(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  workout_name TEXT NOT NULL,
  workout_description TEXT,
  is_rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client Program Exercises (exercises per day)
CREATE TABLE public.client_program_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.client_program_days(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL DEFAULT 'main',
  exercise_name TEXT NOT NULL,
  sets TEXT,
  reps_or_time TEXT,
  rest TEXT,
  notes TEXT,
  instructions TEXT,
  demo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client Day Completions (tracking progress)
CREATE TABLE public.client_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_id UUID NOT NULL REFERENCES public.client_program_days(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, day_id)
);

-- Enable RLS on all tables
ALTER TABLE public.client_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_day_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_program_weeks
CREATE POLICY "Admins manage all client program weeks"
ON public.client_program_weeks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own program weeks"
ON public.client_program_weeks FOR SELECT
USING (auth.uid() = client_id);

-- RLS Policies for client_program_days
CREATE POLICY "Admins manage all client program days"
ON public.client_program_days FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own program days"
ON public.client_program_days FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_program_weeks w
    WHERE w.id = week_id AND w.client_id = auth.uid()
  )
);

-- RLS Policies for client_program_exercises
CREATE POLICY "Admins manage all client program exercises"
ON public.client_program_exercises FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own program exercises"
ON public.client_program_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_program_days d
    JOIN public.client_program_weeks w ON w.id = d.week_id
    WHERE d.id = day_id AND w.client_id = auth.uid()
  )
);

-- RLS Policies for client_day_completions
CREATE POLICY "Admins manage all client day completions"
ON public.client_day_completions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients manage own day completions"
ON public.client_day_completions FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_client_program_weeks_updated_at
BEFORE UPDATE ON public.client_program_weeks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_program_days_updated_at
BEFORE UPDATE ON public.client_program_days
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_program_exercises_updated_at
BEFORE UPDATE ON public.client_program_exercises
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();