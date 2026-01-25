-- Add rich content columns to program_day_exercises for detailed exercise instructions
ALTER TABLE public.program_day_exercises 
ADD COLUMN IF NOT EXISTS instructions TEXT;

ALTER TABLE public.program_day_exercises 
ADD COLUMN IF NOT EXISTS form_tips TEXT;

ALTER TABLE public.program_day_exercises 
ADD COLUMN IF NOT EXISTS muscles_targeted TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.program_day_exercises.instructions IS 'Step-by-step exercise instructions, newline-separated';
COMMENT ON COLUMN public.program_day_exercises.form_tips IS 'Form checkpoints and proper technique notes, newline-separated';
COMMENT ON COLUMN public.program_day_exercises.muscles_targeted IS 'Comma-separated list of muscle groups targeted';