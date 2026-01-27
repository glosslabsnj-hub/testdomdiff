-- Add new intake fields to profiles for enhanced template matching
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS goal_type text,
ADD COLUMN IF NOT EXISTS dietary_restrictions text,
ADD COLUMN IF NOT EXISTS meal_prep_preference text,
ADD COLUMN IF NOT EXISTS food_dislikes text,
ADD COLUMN IF NOT EXISTS training_style text,
ADD COLUMN IF NOT EXISTS session_length_preference text;