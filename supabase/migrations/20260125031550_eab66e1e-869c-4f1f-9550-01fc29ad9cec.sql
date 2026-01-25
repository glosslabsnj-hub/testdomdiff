-- Table for user-specific routine duration overrides
CREATE TABLE public.user_routine_durations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.discipline_templates(id) ON DELETE CASCADE,
  routine_index INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id, routine_index)
);

-- Enable RLS
ALTER TABLE public.user_routine_durations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_routine_durations
CREATE POLICY "Users can view their own duration overrides"
  ON public.user_routine_durations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own duration overrides"
  ON public.user_routine_durations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own duration overrides"
  ON public.user_routine_durations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own duration overrides"
  ON public.user_routine_durations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_routine_durations_updated_at
  BEFORE UPDATE ON public.user_routine_durations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table for day-level workout completions (replaces exercise-level for 12-week program)
CREATE TABLE public.day_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_workout_id UUID NOT NULL REFERENCES public.program_day_workouts(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_workout_id, week_number)
);

-- Enable RLS
ALTER TABLE public.day_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for day_completions
CREATE POLICY "Users can view their own day completions"
  ON public.day_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own day completions"
  ON public.day_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day completions"
  ON public.day_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_day_completions_user_week ON public.day_completions(user_id, week_number);
CREATE INDEX idx_user_routine_durations_user_template ON public.user_routine_durations(user_id, template_id);