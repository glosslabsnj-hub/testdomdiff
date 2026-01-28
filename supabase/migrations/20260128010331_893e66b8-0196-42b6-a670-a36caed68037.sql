-- Add premium coaching fields to program_template_exercises
ALTER TABLE public.program_template_exercises
ADD COLUMN IF NOT EXISTS coach_notes TEXT,
ADD COLUMN IF NOT EXISTS scaling_options TEXT,
ADD COLUMN IF NOT EXISTS progression_notes TEXT;

-- Add the same columns to client_program_exercises so they copy over during assignment
ALTER TABLE public.client_program_exercises
ADD COLUMN IF NOT EXISTS coach_notes TEXT,
ADD COLUMN IF NOT EXISTS scaling_options TEXT,
ADD COLUMN IF NOT EXISTS progression_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.program_template_exercises.coach_notes IS 'Personalized coaching cues for Free World clients';
COMMENT ON COLUMN public.program_template_exercises.scaling_options IS 'Alternative exercise options for different ability levels';
COMMENT ON COLUMN public.program_template_exercises.progression_notes IS 'Week-over-week progression instructions';