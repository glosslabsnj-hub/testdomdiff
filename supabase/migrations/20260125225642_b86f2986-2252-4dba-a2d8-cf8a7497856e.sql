-- Add setup wizard tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS setup_wizard_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_wizard_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS wake_time time DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS sleep_time time DEFAULT '22:00:00';