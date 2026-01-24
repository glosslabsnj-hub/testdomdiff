-- Add coach notes and review tracking to check_ins table
ALTER TABLE public.check_ins 
ADD COLUMN IF NOT EXISTS coach_notes TEXT,
ADD COLUMN IF NOT EXISTS coach_reviewed_at TIMESTAMP WITH TIME ZONE;