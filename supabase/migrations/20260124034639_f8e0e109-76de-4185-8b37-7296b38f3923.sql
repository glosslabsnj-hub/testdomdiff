-- Add demo_url field to program_day_exercises for video/GIF demos
ALTER TABLE public.program_day_exercises 
ADD COLUMN IF NOT EXISTS demo_url TEXT;

-- Create workout_completions table to track user exercise progress
CREATE TABLE public.workout_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.program_day_exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_number INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate completions
CREATE UNIQUE INDEX workout_completions_unique_idx 
ON public.workout_completions(user_id, exercise_id, week_number);

-- Enable RLS
ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view their own completions"
ON public.workout_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert their own completions"
ON public.workout_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own completions
CREATE POLICY "Users can delete their own completions"
ON public.workout_completions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX workout_completions_user_week_idx 
ON public.workout_completions(user_id, week_number);