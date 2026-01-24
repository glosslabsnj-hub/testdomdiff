-- Add display name fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS display_name_preference TEXT DEFAULT 'full_name';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.display_name IS 'Custom nickname for community display';
COMMENT ON COLUMN public.profiles.display_name_preference IS 'How name appears in community: nickname, first_name, or full_name';