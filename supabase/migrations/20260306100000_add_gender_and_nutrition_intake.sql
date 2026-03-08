-- Add gender to profiles for accurate calorie calculations
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';

-- Ensure all nutrition intake columns exist (some may already be present)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS food_dislikes TEXT,
  ADD COLUMN IF NOT EXISTS meal_prep_preference TEXT,
  ADD COLUMN IF NOT EXISTS nutrition_style TEXT,
  ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderately_active',
  ADD COLUMN IF NOT EXISTS body_fat_estimate TEXT;
