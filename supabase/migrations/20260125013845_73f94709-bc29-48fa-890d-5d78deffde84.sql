-- Add duration and description to user_custom_routines
ALTER TABLE public.user_custom_routines 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 5;

ALTER TABLE public.user_custom_routines 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add duration and description to discipline_routines (admin templates)
ALTER TABLE public.discipline_routines 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 5;

ALTER TABLE public.discipline_routines 
ADD COLUMN IF NOT EXISTS description TEXT;