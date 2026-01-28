-- Add premium coaching content fields to program_template_exercises
ALTER TABLE public.program_template_exercises
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS form_tips text,
ADD COLUMN IF NOT EXISTS video_url text;

-- Also add to client_program_exercises so they transfer on assignment
ALTER TABLE public.client_program_exercises
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS form_tips text,
ADD COLUMN IF NOT EXISTS video_url text;